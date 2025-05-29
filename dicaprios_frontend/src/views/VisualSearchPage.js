// dicaprios_frontend/src/views/VisualSearchPage.js
import React, { useState } from 'react';
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
    CardContent,
    Tooltip
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// import { Link as RouterLink } from 'react-router-dom'; // Ya no es necesario si quitamos el botón

const BACKEND_BASE_URL = 'http://127.0.0.1:8000';
const VISUAL_SEARCH_API_URL = `${BACKEND_BASE_URL}/api/visual-search/search/`;

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const VisualSearchPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setError(`Tipo de archivo no permitido. Por favor, sube ${ALLOWED_FILE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}.`);
                setSelectedFile(null);
                setPreviewUrl(null);
                event.target.value = null;
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setError(`El archivo es demasiado grande. El tamaño máximo permitido es ${MAX_FILE_SIZE_MB}MB.`);
                setSelectedFile(null);
                setPreviewUrl(null);
                event.target.value = null;
                return;
            }
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
            let userErrorMessage = 'Ocurrió un error inesperado durante la búsqueda.';
            if (err.response) {
                const status = err.response.status;
                const data = err.response.data;
                if (status === 400) {
                    userErrorMessage = data.error || data.message || "Error en los datos enviados. Verifica la imagen.";
                } else if (status === 401 || status === 403) {
                    userErrorMessage = "No tienes permiso para realizar esta acción. Por favor, inicia sesión de nuevo.";
                } else if (status === 503) {
                    userErrorMessage = "El servicio de búsqueda no está disponible temporalmente. Inténtalo más tarde.";
                } else if (data && (data.error || data.message)) {
                    userErrorMessage = data.error || data.message;
                } else {
                    userErrorMessage = `Error del servidor (${status}). Inténtalo más tarde.`;
                }
            } else if (err.request) {
                userErrorMessage = 'No se pudo conectar al servidor. Verifica tu conexión e inténtalo de nuevo.';
            }
            setError(userErrorMessage);
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
                <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" align="center" sx={{ mb: 0 }}>
                        Sube una imagen de un zapato y encontraremos los más parecidos.
                    </Typography>
                    <Tooltip title="Para mejores resultados, usa imágenes claras del producto, preferiblemente sobre un fondo neutro." arrow>
                        <InfoOutlinedIcon color="action" sx={{ ml: 1, cursor: 'pointer' }} />
                    </Tooltip>
                </Box>
                 <Typography variant="caption" display="block" align="center" color="textSecondary" sx={{ mb: 3 }}>
                    Formatos permitidos: {ALLOWED_FILE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}. Tamaño máximo: {MAX_FILE_SIZE_MB}MB.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <Grid container spacing={2} alignItems="center" justifyContent="center">
                        <Grid item xs={12} sm={8} md={6}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<PhotoCamera />}
                                sx={{ py: 1.5 }}
                            >
                                Seleccionar Imagen
                                <input
                                    id="visual-search-file-input"
                                    type="file"
                                    hidden
                                    accept={ALLOWED_FILE_TYPES.join(',')}
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
                            <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, overflow: 'hidden' }}>
                                <CardMedia
                                    component="img"
                                    sx={{
                                        width: { xs: '100%', sm: 200, md: 250 },
                                        minHeight: { xs: 200, sm: 250 },
                                        objectFit: 'contain',
                                        p: 1,
                                        backgroundColor: 'grey.100'
                                    }}
                                    image={searchResult.product.imagen_url}
                                    alt={searchResult.product.nombre_producto}
                                />
                                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography gutterBottom variant="h6" component="div">
                                            {searchResult.product.nombre_producto}
                                        </Typography>
                                        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Precio: ${parseFloat(searchResult.product.precio).toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Talla: {searchResult.product.talla || 'No especificada'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Color: {searchResult.product.color}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Categoría: {searchResult.product.categoria_nombre || 'No especificada'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Proveedor: {searchResult.product.proveedor_nombre || 'No especificado'}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="primary.main">
                                            Similitud Encontrada: {(searchResult.similarity_score * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    {/* --- BOTÓN "VER DETALLES" COMENTADO/ELIMINADO --- */}
                                    {/*
                                    <Button 
                                        component={RouterLink} 
                                        to={`/productos/${searchResult.product.id}`} // O la ruta de edición si se prefiere
                                        variant="outlined" 
                                        size="small"
                                        sx={{ mt: 2, alignSelf: {sm: 'flex-start'} }}
                                    >
                                        Ver Detalles del Producto
                                    </Button>
                                    */}
                                </CardContent>
                            </Card>
                        ) : (
                            <Alert severity="info">
                                {searchResult.message || "No se encontraron productos con la similitud requerida."}
                                <br />
                                Intenta con otra imagen o una foto más clara del zapato.
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