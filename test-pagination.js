// Test script for pagination endpoint
const http = require('http');

// Test default pagination (page 1, limit 20)
const testDefaultPagination = () => {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/vaults',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const response = JSON.parse(data);
            console.log('✅ Default Pagination Test:');
            console.log('Page:', response.pagination.current_page);
            console.log('Limit:', response.pagination.per_page);
            console.log('Total Vaults:', response.pagination.total_vaults);
            console.log('Vaults returned:', response.vaults.length);
            console.log('Has next page:', response.pagination.has_next_page);
            
            // Verify acceptance criteria
            if (response.pagination.current_page === 1 && 
                response.pagination.per_page === 20 &&
                response.vaults.length <= 20) {
                console.log('🎉 SUCCESS: Default pagination works!');
            }
        });
    });
    req.end();
};

// Test page 2 with limit 10
const testPage2Limit10 = () => {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/vaults?page=2&limit=10',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const response = JSON.parse(data);
            console.log('\n✅ Page 2 Limit 10 Test:');
            console.log('Page:', response.pagination.current_page);
            console.log('Limit:', response.pagination.per_page);
            console.log('Vaults returned:', response.vaults.length);
            console.log('Has prev page:', response.pagination.has_prev_page);
            
            // Verify acceptance criteria
            if (response.pagination.current_page === 2 && 
                response.pagination.per_page === 10 &&
                response.vaults.length <= 10) {
                console.log('🎉 SUCCESS: Custom pagination works!');
            }
        });
    });
    req.end();
};

// Run tests
console.log('🧪 Testing Pagination for Issue #18\n');
testDefaultPagination();
testPage2Limit10();
