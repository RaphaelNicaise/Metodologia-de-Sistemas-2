// frontend/src/pages/Dashboard/components/GastosPorCategoriaChart.tsx
import { Card, Spinner, Alert } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { useVentasCharts } from '../../hooks/useVentasCharts'; // Usamos el mismo hook

// Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Función para generar colores aleatorios
const getRandomColor = () => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`;

const GastosPorCategoriaChart = () => {
    const { data, loading, error } = useVentasCharts();

    // Estado de carga
    if (loading) {
        return (
            <Card className="h-100">
                <Card.Body className="d-flex justify-content-center align-items-center">
                    <Spinner animation="border" />
                </Card.Body>
            </Card>
        );
    }

    // Estado de error
    if (error || !data.expenseSummary) {
        return (
            <Card className="h-100">
                <Card.Body>
                    <Alert variant="danger" className="m-0">Error al cargar gastos.</Alert>
                </Card.Body>
            </Card>
        );
    }

    // Preparar los datos para el gráfico
    const labels = data.expenseSummary.map(g => g.category.charAt(0).toUpperCase() + g.category.slice(1));
    const totals = data.expenseSummary.map(g => g.total_amount);
    const backgroundColors = data.expenseSummary.map(() => getRandomColor());

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Total Gastado',
                data: totals,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Gastos por Categoría (Total)',
                font: { size: 16 }
            },
        },
    };

    return (
        <Card className="shadow-sm h-100">
            <Card.Body>
                {totals.length > 0 ? (
                    <Doughnut options={options} data={chartData} />
                ) : (
                    <Alert variant="info" className="m-0">No hay datos de gastos para mostrar.</Alert>
                )}
            </Card.Body>
        </Card>
    );
};

export default GastosPorCategoriaChart;