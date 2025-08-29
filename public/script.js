class VendorManager {
    constructor() {
        this.baseUrl = '/api/vendors';
        this.currentEditId = null;
        this.initializeEventListeners();
        this.loadVendors();
    }

    initializeEventListeners() {
        const form = document.getElementById('vendorForm');
        const cancelBtn = document.getElementById('cancelBtn');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        cancelBtn.addEventListener('click', () => this.cancelEdit());
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const vendorData = {
            name: formData.get('name'),
            contact_email: formData.get('contact_email'),
            phone_number: formData.get('phone_number'),
            address: formData.get('address')
        };

        try {
            if (this.currentEditId) {
                await this.updateVendor(this.currentEditId, vendorData);
            } else {
                await this.createVendor(vendorData);
            }
            this.resetForm();
            this.loadVendors();
        } catch (error) {
            this.showError('Failed to save vendor: ' + error.message);
        }
    }

    async createVendor(vendorData) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vendorData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create vendor');
        }

        return await response.json();
    }

    async loadVendors() {
        try {
            this.showLoading();
            const response = await fetch(this.baseUrl);
            
            if (!response.ok) {
                throw new Error('Failed to load vendors');
            }

            const vendors = await response.json();
            this.displayVendors(vendors);
        } catch (error) {
            this.showError('Error loading vendors: ' + error.message);
        }
    }

    displayVendors(vendors) {
        const tableBody = document.getElementById('vendorsTableBody');
        const table = document.getElementById('vendorsTable');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');

        // Hide loading and error messages
        loading.style.display = 'none';
        error.style.display = 'none';

        if (vendors.length === 0) {
            table.style.display = 'none';
            loading.textContent = 'No vendors found. Add your first vendor above!';
            loading.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        tableBody.innerHTML = '';

        vendors.forEach(vendor => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${this.escapeHtml(vendor.name)}</td>
                <td>${this.escapeHtml(vendor.contact_email || '-')}</td>
                <td>${this.escapeHtml(vendor.phone_number || '-')}</td>
                <td>${this.escapeHtml(vendor.address || '-')}</td>
                <td>${new Date(vendor.date_created).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${vendor.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${vendor.id}">Delete</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        tableBody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.editVendor(id);
            });
        });

        tableBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.deleteVendor(id);
            });
        });
    }

    async editVendor(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch vendor details');
            }

            const vendor = await response.json();
            this.populateForm(vendor);
            this.setEditMode(true, id);
        } catch (error) {
            this.showError('Error loading vendor details: ' + error.message);
        }
    }

    populateForm(vendor) {
        document.getElementById('vendorId').value = vendor.id;
        document.getElementById('name').value = vendor.name || '';
        document.getElementById('contact_email').value = vendor.contact_email || '';
        document.getElementById('phone_number').value = vendor.phone_number || '';
        document.getElementById('address').value = vendor.address || '';
    }

    setEditMode(isEdit, id = null) {
        this.currentEditId = id;
        const title = document.getElementById('form-title');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (isEdit) {
            title.textContent = 'Edit Vendor';
            submitBtn.textContent = 'Update Vendor';
            cancelBtn.style.display = 'inline-block';
        } else {
            title.textContent = 'Add New Vendor';
            submitBtn.textContent = 'Add Vendor';
            cancelBtn.style.display = 'none';
        }
    }

    cancelEdit() {
        this.resetForm();
        this.setEditMode(false);
    }

    resetForm() {
        document.getElementById('vendorForm').reset();
        document.getElementById('vendorId').value = '';
        this.setEditMode(false);
    }

    async updateVendor(id, vendorData) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vendorData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update vendor');
        }

        return await response.json();
    }

    async deleteVendor(id) {
        if (!confirm('Are you sure you want to delete this vendor?')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete vendor');
            }

            this.loadVendors();
        } catch (error) {
            this.showError('Error deleting vendor: ' + error.message);
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('vendorsTable').style.display = 'none';
        document.getElementById('error').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('vendorsTable').style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VendorManager();
});