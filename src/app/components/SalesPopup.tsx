import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface SalesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  adGroup: string;
  currentSales: number;
}

const SalesPopup: React.FC<SalesPopupProps> = ({ isOpen, onClose, adGroup, currentSales }) => {
  if (!isOpen) return null;

  // Generate 30 days of dummy data based on the current sales value
  const generateDummyData = () => {
    const dates = [];
    const salesData = [];
    const baseValue = currentSales;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString());
      
      // Generate random variations around the base value
      const randomVariation = baseValue * (0.5 + Math.random());
      salesData.push(Math.round(randomVariation));
    }
    
    return { dates, salesData };
  };

  const { dates, salesData } = generateDummyData();

  const options = {
    chart: {
      type: 'line' as const,
      height: 350,
      zoom: {
        enabled: true
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        }
      },
      background: 'transparent',
      fontFamily: 'Roboto, sans-serif'
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 6
      }
    },
    grid: {
      borderColor: '#334155',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      categories: dates,
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
          fontFamily: 'Roboto, sans-serif'
        }
      },
      axisBorder: {
        color: '#334155'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
          fontFamily: 'Roboto, sans-serif'
        },
        formatter: (value: number) => `₹${value.toLocaleString('en-IN')}` // Changed to Rupee and en-IN format
      }
    },
    title: {
      text: `30-Day Sales Trend for ${adGroup}`,
      align: 'center' as const,
      style: {
        color: '#f1f5f9',
        fontSize: '18px',
        fontWeight: '500',
        fontFamily: 'Roboto, sans-serif'
      }
    },
    theme: {
      mode: 'dark' as const
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value: number) => `₹${value.toLocaleString('en-IN')}` // Changed to Rupee and en-IN format
      }
    }
  };

  const series = [{
    name: 'Sales',
    data: salesData
  }];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 p-8 rounded-xl w-[90%] max-w-5xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-100">
            Sales Performance
            <span className="block text-sm text-slate-400 mt-1">
              Last 30 days analysis
            </span>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors duration-200"
            aria-label="Close sales performance popup"
          >
            <svg 
              className="w-6 h-6 text-slate-400 hover:text-slate-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-slate-800">
              <p className="text-slate-400 text-sm">Current Sales</p>
              <p className="text-2xl font-semibold text-slate-100">
                ₹{currentSales.toLocaleString('en-IN')} {/* Changed to Rupee and en-IN format */}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800">
              <p className="text-slate-400 text-sm">Average</p>
              <p className="text-2xl font-semibold text-slate-100">
                ₹{Math.round(salesData.reduce((a, b) => a + b, 0) / salesData.length).toLocaleString('en-IN')} {/* Changed to Rupee and en-IN format */}
              </p>
            </div>
          </div>
          
          <ReactApexChart
            type="line"
            options={options}
            series={series}
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesPopup;