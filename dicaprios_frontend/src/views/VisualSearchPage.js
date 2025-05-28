// dicaprios_frontend/src/views/VisualSearchPage.js
import React, { useState } from 'react'; // useEffect ya no es necesario si no hay lógica adicional
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    Button,
    CircularProgress,
    Paper,
    Grid,
    Alert,
    Card,
    CardMedia,
    CardContent
    // Link as MuiLink // No se está usando actualmente
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
// import { Link as RouterLink } from 'react-router-dom'; // Si quieres enlazar a la página del producto

const BACKEND_BASE_URL = 'http://127.0.0.1:8000'; // Asegúrate que esta sea la URL base de tu Django backend
const VISUAL_SEARCH_API_URL = `${BACKEND_BASE_URL}/api/visual-search/search/`;

const VisualSearchPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setSearchResult(null);
            setError('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError('Por favor, selecciona una imagen para buscar.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSearchResult(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.post(VISUAL_SEARCH_API_URL, formData, { headers });
            setSearchResult(response.data);

        } catch (err) {
            console.error('Error en la búsqueda visual:', err);
            if (err.response) {
                setError(err.response.data.error || err.response.data.message || `Error del servidor: ${err.response.status}`);
            } else if (err.request) {
                setError('No se pudo conectar al servidor. Verifica tu conexión.');
            } else {
                setError('Ocurrió un error al preparar la búsqueda.');
            }
            setSearchResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setSearchResult(null);
        setError('');
        const fileInput = document.getElementById('visual-search-file-input');
        if (fileInput) {
            fileInput.value = null;
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Buscador Visual de Zapatos
                </Typography>
                <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 3 }}>
                    Sube una imagen de un zapato y encontraremos los más parecidos en nuestro catálogo.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <Grid container spacing={2} alignItems="center" justifyContent="center">
                        <Grid item xs={12} sm={8} md={6}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<PhotoCamera />}
                            >
                                Seleccionar Imagen
                                <input
                                    id="visual-search-file-input"
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </Grid>
                    </Grid>

                    {previewUrl && (
                        <Box sx={{ my: 3, textAlign: 'center' }}>
                            <Typography variant="subtitle2" gutterBottom>Vista previa:</Typography>
                            <Box
                                component="img"
                                src={previewUrl}
                                alt="Vista previa"
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '300px',
                                    mt: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    objectFit: 'contain'
                                }}
                            />
                            <Button onClick={clearSelection} color="error" sx={{ mt: 1 }}>
                                Quitar Imagen
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading || !selectedFile}
                            sx={{ minWidth: '150px', py: 1.5 }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mt: 3 }}>
                        {error}
                    </Alert>
                )}

                {searchResult && !isLoading && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" component="h2" gutterBottom align="center">
                            Resultados de la Búsqueda
                        </Typography>
                        {searchResult.match_found && searchResult.product ? (
                            <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                                <CardMedia
                                    component="img"
                                    sx={{
                                        width: { xs: '100%', sm: 200, md: 250 },
                                        height: { xs: 200, sm: 'auto' },
                                        objectFit: 'contain',
                                        p: 1,
                                        backgroundColor: '#f5f5f5'
                                    }}
                                    // --- CAMBIO AQUÍ: usar imagen_url ---
                                    image={searchResult.product.imagen_url} 
                                    alt={searchResult.product.nombre_producto}
                                />
                                <CardContent sx={{ flex: 1 }}>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {searchResult.product.nombre_producto}
                                    </Typography>
                                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Precio: ${parseFloat(searchResult.product.precio).toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Talla: {searchResult.product.talla || 'No especificada'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Color: {searchResult.product.color}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Categoría: {searchResult.product.categoria_nombre || 'No especificada'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Proveedor: {searchResult.product.proveedor_nombre || 'No especificado'}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="primary.main">
                                        Similitud Encontrada: {(searchResult.similarity_score * 100).toFixed(1)}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        ) : (
                            <Alert severity="info">
                                {searchResult.message || "No se encontraron productos con la similitud requerida."}
                                {searchResult.best_similarity_score !== undefined && (
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        Mejor similitud obtenida: {(searchResult.best_similarity_score * 100).toFixed(1)}%
                                    </Typography>
                                )}
                            </Alert>
                        )}
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default VisualSearchPage;