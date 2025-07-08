// AV Digital Proving Ground Cost Visualizer JavaScript

// Data from the application
const costData = {
  "base_costs": [
    {"component": "Cloud Computing (AWS/Azure)", "cost": 25.0, "percentage": 25.0, "description": "EC2 instances, Lambda functions, API Gateway"},
    {"component": "GPU Computing", "cost": 18.0, "percentage": 18.0, "description": "P3/G4 instances for ML training and inference"},
    {"component": "Data Storage", "cost": 12.0, "percentage": 12.0, "description": "S3 storage for simulation data and assets"},
    {"component": "Unreal Engine License", "cost": 8.0, "percentage": 8.0, "description": "Unreal Engine subscription for simulation"},
    {"component": "Simulation Software", "cost": 15.0, "percentage": 15.0, "description": "Specialized AV simulation tools and licenses"},
    {"component": "Data Transfer/Bandwidth", "cost": 7.0, "percentage": 7.0, "description": "Data ingress/egress and CDN costs"},
    {"component": "Asset Management", "cost": 5.0, "percentage": 5.0, "description": "Asset versioning and management systems"},
    {"component": "Security & Compliance", "cost": 3.0, "percentage": 3.0, "description": "Security monitoring and compliance tools"},
    {"component": "Platform Operations", "cost": 4.0, "percentage": 4.0, "description": "Load balancing, monitoring, logging"},
    {"component": "Remaining Balance", "cost": 3.0, "percentage": 3.0, "description": "Buffer for unexpected costs and scaling"}
  ],
  "scaling_scenarios": [
    {"scenario": "Light Usage (10 hours/month)", "monthly_cost": 100, "hourly_rate": 10.0, "primary_cost_driver": "GPU compute and licensing"},
    {"scenario": "Medium Usage (50 hours/month)", "monthly_cost": 350, "hourly_rate": 7.0, "primary_cost_driver": "Balanced compute and storage"},
    {"scenario": "Heavy Usage (200 hours/month)", "monthly_cost": 1200, "hourly_rate": 6.0, "primary_cost_driver": "Heavy GPU and data processing"},
    {"scenario": "Enterprise Usage (500 hours/month)", "monthly_cost": 2800, "hourly_rate": 5.6, "primary_cost_driver": "Enterprise licensing and support"},
    {"scenario": "Continuous Usage (720 hours/month)", "monthly_cost": 4500, "hourly_rate": 6.25, "primary_cost_driver": "Infrastructure and data transfer"}
  ],
  "additional_considerations": [
    {"consideration": "Data Ingress from Vehicles", "potential_cost": 50, "description": "Real-time data streaming from test vehicles"},
    {"consideration": "Machine Learning Model Training", "potential_cost": 200, "description": "Training AI models for autonomous driving"},
    {"consideration": "Multi-Region Deployment", "potential_cost": 150, "description": "Global deployment for reduced latency"},
    {"consideration": "High Availability & Disaster Recovery", "potential_cost": 100, "description": "Backup systems and failover mechanisms"},
    {"consideration": "Compliance & Audit Requirements", "potential_cost": 75, "description": "Meeting automotive industry regulations"},
    {"consideration": "Third-Party API Integrations", "potential_cost": 25, "description": "Integration with vehicle systems and sensors"},
    {"consideration": "Custom Development & Maintenance", "potential_cost": 300, "description": "Custom feature development and updates"},
    {"consideration": "User Training & Support", "potential_cost": 50, "description": "Training materials and support staff"},
    {"consideration": "Simulation Asset Licensing", "potential_cost": 100, "description": "High-fidelity 3D models and environments"},
    {"consideration": "Performance Optimization", "potential_cost": 75, "description": "Performance tuning and optimization services"}
  ]
};

// Global variables
let costChart = null;
let selectedAdditionalCosts = new Set();

// Color palette for charts
const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeChart();
    initializeComponents();
    initializeScaling();
    initializeAdditionalCosts();
});

// Tab switching functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Refresh chart if switching to overview
    if (tabName === 'overview' && costChart) {
        costChart.update();
    }
}

// Initialize the cost breakdown chart
function initializeChart() {
    const ctx = document.getElementById('costChart').getContext('2d');
    
    const data = {
        labels: costData.base_costs.map(item => item.component),
        datasets: [{
            data: costData.base_costs.map(item => item.cost),
            backgroundColor: chartColors,
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const config = {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = ((value / 100) * 100).toFixed(1);
                            return `${label}: $${value} (${percentage}%)`;
                        },
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return costData.base_costs[index].description;
                        }
                    }
                }
            },
            interaction: {
                intersect: false
            }
        }
    };

    costChart = new Chart(ctx, config);
}

// Initialize component details
function initializeComponents() {
    const componentsGrid = document.getElementById('componentsGrid');
    
    costData.base_costs.forEach((component, index) => {
        const componentCard = createComponentCard(component, index);
        componentsGrid.appendChild(componentCard);
    });
}

function createComponentCard(component, index) {
    const card = document.createElement('div');
    card.className = 'component-card';
    
    const optimizationTips = getOptimizationTips(component.component);
    const influences = getInfluences(component.component);
    
    card.innerHTML = `
        <div class="component-header">
            <div class="component-title">
                <span class="component-name">${component.component}</span>
                <span class="component-cost">$${component.cost.toFixed(2)}</span>
            </div>
            <div class="cost-bar">
                <div class="cost-bar-fill" style="width: ${component.percentage}%; background-color: ${chartColors[index]}"></div>
            </div>
        </div>
        <div class="component-body">
            <p class="component-description">${component.description}</p>
            <button class="component-toggle" onclick="toggleComponentDetails(this)">
                <span>View Details</span>
                <span>↓</span>
            </button>
            <div class="component-details">
                <div class="detail-section">
                    <div class="detail-title">What influences this cost:</div>
                    <div class="detail-content">${influences}</div>
                </div>
                <div class="detail-section">
                    <div class="detail-title">Optimization tips:</div>
                    <div class="detail-content">${optimizationTips}</div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function toggleComponentDetails(button) {
    const details = button.nextElementSibling;
    const arrow = button.querySelector('span:last-child');
    
    if (details.classList.contains('expanded')) {
        details.classList.remove('expanded');
        arrow.textContent = '↓';
        button.querySelector('span:first-child').textContent = 'View Details';
    } else {
        details.classList.add('expanded');
        arrow.textContent = '↑';
        button.querySelector('span:first-child').textContent = 'Hide Details';
    }
}

function getOptimizationTips(component) {
    const tips = {
        'Cloud Computing (AWS/Azure)': 'Use reserved instances for predictable workloads, implement auto-scaling, and choose the right instance types for your workload.',
        'GPU Computing': 'Use spot instances for non-critical workloads, implement efficient batching, and consider serverless GPU options.',
        'Data Storage': 'Use lifecycle policies to move data to cheaper storage tiers, implement data compression, and clean up unused data regularly.',
        'Unreal Engine License': 'Consider usage-based licensing, evaluate if all features are needed, and negotiate enterprise pricing.',
        'Simulation Software': 'Bundle licenses when possible, use concurrent licensing efficiently, and evaluate open-source alternatives.',
        'Data Transfer/Bandwidth': 'Use CDN caching, implement data compression, and minimize cross-region transfers.',
        'Asset Management': 'Implement efficient caching strategies, use version control effectively, and automate asset cleanup.',
        'Security & Compliance': 'Use managed security services, implement automation, and avoid over-provisioning.',
        'Platform Operations': 'Use managed services where possible, implement efficient monitoring, and automate routine tasks.',
        'Remaining Balance': 'Monitor usage patterns, implement cost alerts, and regularly review and optimize spending.'
    };
    return tips[component] || 'Monitor usage and optimize based on actual needs.';
}

function getInfluences(component) {
    const influences = {
        'Cloud Computing (AWS/Azure)': 'Instance types, usage duration, auto-scaling policies, and region selection.',
        'GPU Computing': 'Instance types (P3/G4), usage patterns, training vs inference workloads, and parallelization efficiency.',
        'Data Storage': 'Storage volume, access patterns, retention policies, and storage class selection.',
        'Unreal Engine License': 'Number of seats, usage frequency, and subscription tier selected.',
        'Simulation Software': 'License type, number of concurrent users, and feature set required.',
        'Data Transfer/Bandwidth': 'Data volume, transfer frequency, geographic distribution, and caching efficiency.',
        'Asset Management': 'Asset count, versioning complexity, and access patterns.',
        'Security & Compliance': 'Compliance requirements, security level needed, and audit frequency.',
        'Platform Operations': 'System complexity, monitoring depth, and automation level.',
        'Remaining Balance': 'Usage variability, growth plans, and risk tolerance.'
    };
    return influences[component] || 'Various factors including usage patterns and system requirements.';
}

// Initialize scaling calculator
function initializeScaling() {
    const usageHours = document.getElementById('usageHours');
    const numUsers = document.getElementById('numUsers');
    const dataVolume = document.getElementById('dataVolume');
    
    // Set up event listeners for sliders
    usageHours.addEventListener('input', updateScalingResults);
    numUsers.addEventListener('input', updateScalingResults);
    dataVolume.addEventListener('input', updateScalingResults);
    
    // Initialize slider values
    updateSliderValues();
    updateScalingResults();
    
    // Populate scenarios table
    populateScenariosTable();
}

function updateSliderValues() {
    document.getElementById('usageHoursValue').textContent = document.getElementById('usageHours').value;
    document.getElementById('numUsersValue').textContent = document.getElementById('numUsers').value;
    document.getElementById('dataVolumeValue').textContent = document.getElementById('dataVolume').value + ' GB';
}

function updateScalingResults() {
    updateSliderValues();
    
    const hours = parseInt(document.getElementById('usageHours').value);
    const users = parseInt(document.getElementById('numUsers').value);
    const dataGB = parseInt(document.getElementById('dataVolume').value);
    
    // Calculate scaled costs based on usage
    const baseHourlyRate = 7.0; // Base rate for medium usage
    const userMultiplier = Math.max(1, users * 0.3); // Each user adds 30% to base cost
    const dataMultiplier = Math.max(1, dataGB / 100); // Data scaling factor
    
    const monthlyCost = Math.round(hours * baseHourlyRate * userMultiplier * dataMultiplier);
    const hourlyRate = (monthlyCost / hours).toFixed(2);
    const annualCost = monthlyCost * 12;
    
    document.getElementById('monthlyResult').textContent = `$${monthlyCost.toLocaleString()}`;
    document.getElementById('hourlyResult').textContent = `$${hourlyRate}`;
    document.getElementById('annualResult').textContent = `$${annualCost.toLocaleString()}`;
}

function populateScenariosTable() {
    const table = document.getElementById('scenariosTable');
    
    costData.scaling_scenarios.forEach(scenario => {
        const row = document.createElement('div');
        row.className = 'scenario-row';
        
        row.innerHTML = `
            <div class="scenario-name">${scenario.scenario}</div>
            <div class="scenario-cost">$${scenario.monthly_cost.toLocaleString()}</div>
            <div class="scenario-rate">$${scenario.hourly_rate.toFixed(2)}/hour</div>
        `;
        
        table.appendChild(row);
    });
}

// Initialize additional costs
function initializeAdditionalCosts() {
    const additionalGrid = document.getElementById('additionalGrid');
    
    costData.additional_considerations.forEach(consideration => {
        const item = createAdditionalCostItem(consideration);
        additionalGrid.appendChild(item);
    });
    
    updateAdditionalCostsSummary();
}

function createAdditionalCostItem(consideration) {
    const item = document.createElement('div');
    item.className = 'additional-item';
    item.dataset.cost = consideration.potential_cost;
    item.dataset.name = consideration.consideration;
    
    item.innerHTML = `
        <div class="additional-header">
            <div class="additional-name">${consideration.consideration}</div>
            <div class="additional-cost">+$${consideration.potential_cost}</div>
        </div>
        <div class="additional-description">${consideration.description}</div>
    `;
    
    item.addEventListener('click', function() {
        toggleAdditionalCost(this);
    });
    
    return item;
}

function toggleAdditionalCost(item) {
    const costValue = parseInt(item.dataset.cost);
    const name = item.dataset.name;
    
    if (item.classList.contains('selected')) {
        item.classList.remove('selected');
        selectedAdditionalCosts.delete(name);
    } else {
        item.classList.add('selected');
        selectedAdditionalCosts.add(name);
    }
    
    updateAdditionalCostsSummary();
}

function updateAdditionalCostsSummary() {
    let additionalTotal = 0;
    
    selectedAdditionalCosts.forEach(name => {
        const consideration = costData.additional_considerations.find(c => c.consideration === name);
        if (consideration) {
            additionalTotal += consideration.potential_cost;
        }
    });
    
    const totalCost = 100 + additionalTotal;
    
    document.getElementById('additionalTotal').textContent = `$${additionalTotal.toFixed(2)}`;
    document.getElementById('totalCost').textContent = `$${totalCost.toFixed(2)}`;
}

// Export functionality
function exportSummary() {
    const baseCost = 100;
    let additionalTotal = 0;
    
    selectedAdditionalCosts.forEach(name => {
        const consideration = costData.additional_considerations.find(c => c.consideration === name);
        if (consideration) {
            additionalTotal += consideration.potential_cost;
        }
    });
    
    const totalCost = baseCost + additionalTotal;
    
    // Create summary text
    let summary = `AV Digital Proving Ground - Cost Summary\n`;
    summary += `=====================================\n\n`;
    summary += `Base Cost Breakdown ($100):\n`;
    summary += `---------------------------\n`;
    
    costData.base_costs.forEach(component => {
        summary += `${component.component}: $${component.cost.toFixed(2)} (${component.percentage}%)\n`;
    });
    
    if (selectedAdditionalCosts.size > 0) {
        summary += `\nAdditional Considerations:\n`;
        summary += `-------------------------\n`;
        
        selectedAdditionalCosts.forEach(name => {
            const consideration = costData.additional_considerations.find(c => c.consideration === name);
            if (consideration) {
                summary += `${consideration.consideration}: +$${consideration.potential_cost}\n`;
            }
        });
    }
    
    summary += `\nTotal Cost: $${totalCost.toFixed(2)}\n`;
    summary += `\nGenerated on: ${new Date().toLocaleDateString()}\n`;
    
    // Create and download file
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'av_proving_ground_cost_summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
}

// Make functions available globally
window.switchTab = switchTab;
window.toggleComponentDetails = toggleComponentDetails;
window.exportSummary = exportSummary;