import { Card } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { useVentasCharts } from '../../../hooks/useVentasCharts';
import './DashboardCharts.css';

// Registrar los componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Función para generar colores aleatorios
const getRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
};


const MetodosDePagoChart = () => {
    const { data, loading } = useVentasCharts(); // Reutilizamos el mismo hook

    // Damos formato a los datos
    const formatData = () => {
        if (!data.customerInsights?.payment_preferences) {
            return { labels: [], datasets: [] };
        }

        const preferences = data.customerInsights.payment_preferences;

        const labels = preferences.map(p => p.payment_method);
        const chartData = preferences.map(p => p.total);
        const backgroundColors = preferences.map(() => getRandomColor());

        return {
            labels,
            datasets: [
                {
                    label: 'Total Vendido',
                    data: chartData,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.7', '1')), // Bordes más sólidos
                    borderWidth: 1,
                },
            ],
        };
    };

    const chartData = formatData();

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: false,
            },
        },
    };

    return (
        <Card className="dashboard-chart-card shadow-sm">
            <Card.Body>
                <Card.Title as="h6">Ventas por Método de Pago</Card.Title>
                <div className="chart-container">
                    {loading ? <p>Cargando gráfico...</p> : <Doughnut data={chartData} options={options} />}
                </div>
            </Card.Body>
        </Card>
    );
};

export default MetodosDePagoChart;