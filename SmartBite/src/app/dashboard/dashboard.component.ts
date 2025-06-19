import { Component, AfterViewInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import Chart from 'chart.js/auto';

interface OccupancyData {
  hour: string;
  occupancy: number;
  rawHour: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  currentTime: string = '';
  currentHourDisplay: string = '';
  currentOccupancy: string = '';
  constructor(private renderer: Renderer2, private el: ElementRef) {}
  
  // Chart instances
  private footfallChart: Chart | null = null;
  private orderChart: Chart | null = null;
  private vendorChart: Chart | null = null;
  
  // Intervals
  private timeInterval: any;
  private heatmapInterval: any;
  private dataUpdateInterval: any;

  ngAfterViewInit() {
    this.initializeDashboard();
  }

  ngOnDestroy() {
    // Clean up intervals
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.heatmapInterval) {
      clearInterval(this.heatmapInterval);
    }
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
    }
    
    // Destroy chart instances
    if (this.footfallChart) {
      this.footfallChart.destroy();
    }
    if (this.orderChart) {
      this.orderChart.destroy();
    }
    if (this.vendorChart) {
      this.vendorChart.destroy();
    }
  }

  private initializeDashboard() {
    this.updateTime();
    this.createHourlyHeatmap();
    this.initializeCharts();
    this.initializeAnimations();
    this.addNotificationHandlers();
    
    // Set up intervals
    this.timeInterval = setInterval(() => this.updateTime(), 1000);
    this.heatmapInterval = setInterval(() => this.createHourlyHeatmap(), 60000);
    
    // Uncomment the line below to enable real-time data simulation
    // this.dataUpdateInterval = setInterval(() => this.simulateDataUpdate(), 30000);
  }

  // Update time function
  private updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleString();
    
    // Update current hour display
    const currentHour = now.getHours();
    this.currentHourDisplay = currentHour === 0 ? '12 AM' : 
                             currentHour <= 12 ? `${currentHour} ${currentHour === 12 ? 'PM' : 'AM'}` : 
                             `${currentHour - 12} PM`;
    
    // Update current-time element if it exists
    const currentTimeElement = document.getElementById('current-time');
    if (currentTimeElement) {
      currentTimeElement.textContent = this.currentTime;
    }
    
    // Update current-hour-display element if it exists
    const currentHourElement = document.getElementById('current-hour-display');
    if (currentHourElement) {
      currentHourElement.textContent = this.currentHourDisplay;
    }
  }

  // Generate hourly occupancy data
  private generateHourlyOccupancy(): OccupancyData[] {
    const occupancyData: OccupancyData[] = [];
    
    // Business hours: 8 AM to 8 PM (12 hours)
    for (let i = 8; i <= 19; i++) {
      const hour = i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`;
      
      // Generate realistic occupancy data with peak hours
      let occupancy: number;
      if (i >= 12 && i <= 14) { // Lunch peak
        occupancy = Math.floor(Math.random() * 20) + 70; // 70-90%
      } else if (i >= 17 && i <= 19) { // Evening peak
        occupancy = Math.floor(Math.random() * 25) + 60; // 60-85%
      } else if (i >= 8 && i <= 10) { // Morning moderate
        occupancy = Math.floor(Math.random() * 30) + 40; // 40-70%
      } else { // Off-peak hours
        occupancy = Math.floor(Math.random() * 35) + 25; // 25-60%
      }
      
      occupancyData.push({
        hour: hour,
        occupancy: occupancy,
        rawHour: i
      });
    }
    
    return occupancyData;
  }

  // Get color based on occupancy percentage
  private getOccupancyColor(occupancy: number): string {
    if (occupancy <= 30) return '#95a5a6'; // Low - Gray
    if (occupancy <= 50) return '#3DCD58'; // Medium-Low - Light Green
    if (occupancy <= 70) return '#2E8B3E'; // Medium - Dark Green
    if (occupancy <= 85) return '#ff9f43'; // High - Orange
    return '#e74c3c'; // Very High - Red
  }

  // Create hourly heatmap
  private createHourlyHeatmap() {
    const heatmapContainer = document.getElementById('hourly-heatmap');
    const occupancyData = this.generateHourlyOccupancy();

    const currentHour = new Date().getHours();

    if (!heatmapContainer) return;
    
   this.renderer.setProperty(heatmapContainer, 'innerHTML', '');

   occupancyData.forEach(data => {
      // Create heatmap cell
      const cell = this.renderer.createElement('div');
      this.renderer.addClass(cell, 'heatmap-cell');
      this.renderer.setStyle(cell, 'background', this.getOccupancyColor(data.occupancy));
      this.renderer.setProperty(cell, 'textContent', data.hour.split(' ')[0]); // Show only hour number
      this.renderer.setAttribute(cell, 'data-occupancy', `${data.occupancy}% at ${data.hour}`);

      // Highlight current hour
      if (data.rawHour === currentHour) {
        this.renderer.addClass(cell, 'current-hour');
        this.currentOccupancy = `${data.occupancy}% occupied`;
        const currentOccupancyElement = this.el.nativeElement.querySelector('#current-occupancy');
        if (currentOccupancyElement) {
          this.renderer.setProperty(currentOccupancyElement, 'textContent', this.currentOccupancy);
        }
      }

      // Append cell to heatmap container
      this.renderer.appendChild(heatmapContainer, cell);
    });
  }

  // Chart configuration options
  private get chartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        }
      }
    };
  }

  // Initialize all charts
  private initializeCharts() {
    this.initializeFootfallChart();
    this.initializeOrderChart();
    this.initializeVendorChart();
  }

  // Footfall Forecast Chart
  private initializeFootfallChart() {
    const ctx = document.getElementById('footfallChart') as HTMLCanvasElement;
    if (ctx) {
      this.footfallChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            data: [45, 55, 78, 65, 60, 35, 30],
            borderColor: '#3DCD58',
            backgroundColor: 'rgba(61, 205, 88, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }]
        },
        options: this.chartOptions
      });
    }
  }

  // Order Volume Chart
  private initializeOrderChart() {
    const ctx = document.getElementById('orderChart') as HTMLCanvasElement;
    if (ctx) {
      this.orderChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Vendor A', 'Vendor B', 'Vendor C'],
          datasets: [{
            data: [120, 180, 95],
            backgroundColor: ['#3DCD58', '#2E8B3E', '#ff9f43'],
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: this.chartOptions
      });
    }
  }

  // Vendor Performance Chart
  private initializeVendorChart() {
    const ctx = document.getElementById('vendorChart') as HTMLCanvasElement;
    if (ctx) {
      this.vendorChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['9AM', '11AM', '1PM', '3PM', '5PM'],
          datasets: [{
            label: 'Vendor A',
            data: [8, 7, 6, 7, 8],
            borderColor: '#3DCD58',
            backgroundColor: 'rgba(61, 205, 88, 0.1)',
            borderWidth: 3,
            tension: 0.4
          }, {
            label: 'Vendor B',
            data: [12, 11, 10, 11, 13],
            borderColor: '#2E8B3E',
            backgroundColor: 'rgba(46, 139, 62, 0.1)',
            borderWidth: 3,
            tension: 0.4
          }]
        },
        options: {
          ...this.chartOptions,
          plugins: {
            legend: {
              display: true,
              position: 'top' as const
            }
          }
        }
      });
    }
  }

  // Add entrance animations to cards
  private initializeAnimations() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.animation = `fadeInUp 0.8s ease ${index * 0.1}s both`;
    });
  }

  // Add click handlers for notification items
  private addNotificationHandlers() {
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
      item.addEventListener('click', () => {
        (this as unknown as HTMLElement).style.opacity = '0.7';
        setTimeout(() => {
          (this as unknown as HTMLElement).style.opacity = '1';
        }, 200);
      });
    });
  }

  // Real-time data update simulation
  public simulateDataUpdate() {
    // Update footfall chart with new data
    if (this.footfallChart) {
      const newFootfallData = this.footfallChart.data.datasets[0].data.map((value: any) => 
        Math.max(20, (value as number) + Math.random() * 10 - 5)
      );
      this.footfallChart.data.datasets[0].data = newFootfallData;
      this.footfallChart.update('none');
    }

    // Update order chart with new data
    if (this.orderChart) {
      const newOrderData = this.orderChart.data.datasets[0].data.map((value: any) => 
        Math.max(50, (value as number) + Math.random() * 20 - 10)
      );
      this.orderChart.data.datasets[0].data = newOrderData;
      this.orderChart.update('none');
    }

    // Update vendor performance chart
    if (this.vendorChart) {
      this.vendorChart.data.datasets.forEach(dataset => {
        dataset.data = (dataset.data as number[]).map(value => 
          Math.max(5, value + Math.random() * 2 - 1)
        );
      });
      this.vendorChart.update('none');
    }
    
    // Update hourly heatmap
    this.createHourlyHeatmap();
  }

  // Public API methods (equivalent to window.dashboardAPI)
  public getDashboardAPI() {
    return {
      updateTime: () => this.updateTime(),
      simulateDataUpdate: () => this.simulateDataUpdate(),
      createHourlyHeatmap: () => this.createHourlyHeatmap(),
      charts: {
        footfall: this.footfallChart,
        orders: this.orderChart,
        vendor: this.vendorChart
      }
    };
  }
}