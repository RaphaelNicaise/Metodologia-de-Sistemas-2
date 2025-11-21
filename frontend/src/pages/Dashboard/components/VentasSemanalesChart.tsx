import { Card } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useVentasCharts } from '../../../hooks/useVentasCharts';
import './DashboardCharts.css'; 

// Registrar los componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const VentasSemanalesChart = () => {
    const { data, loading }= useVentasCharts(); // Obtenemos los datos del hook

    // Damos formato a los datos para el gráfico
    const formatData = () => {
        if (!data.ventasSemanales?.daily_breakdown) {
            return { labels: [], datasets: [] };
        }

        const breakdown = data.ventasSemanales.daily_breakdown;

        // Mapeamos los días de la semana (Lunes, Martes, etc.)
        const getDayName = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-AR', { weekday: 'long' });
        };

        const labels = breakdown.map(item => getDayName(item.date));
        const chartData = breakdown.map(item => item.total);

        return {
            labels,
            datasets: [
                {
                    label: 'Ingresos por Ventas',
                    data: chartData,
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
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
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
    };

    return (
        <Card className="dashboard-chart-card shadow-sm">
            <Card.Body>
                <Card.Title as="h6">Ventas de la Última Semana</Card.Title>
                <div className="chart-container">
                    {loading ? <p>Cargando gráfico...</p> : <Line options={options} data={chartData} />}
                </div>
            </Card.Body>
        </Card>
    );
};

export default VentasSemanalesChart;