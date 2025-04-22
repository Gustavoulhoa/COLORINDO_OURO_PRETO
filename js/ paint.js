document.addEventListener('DOMContentLoaded', () => {
    const canvas = new fabric.Canvas('drawing-canvas', {
        backgroundColor: 'white',
        isDrawingMode: true
    });

    let brushColor = '#6F4E37';
    let brushSize = 5;
    let brushTransparency = 1; // 1 = opaco, 0 = transparente
    let imageTransparency = 0.95; // 0 = opaco, 1 = transparente (inverso do slider) - INICIALIZADO COM 95% DE TRANSPARÊNCIA

    // Obter elementos da UI
    const transparencySlider = document.getElementById('transparency-slider');
    const transparencyValue = document.getElementById('transparency-value');

    // Configuração inicial do pincel
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    updateBrushColor();
    canvas.freeDrawingBrush.width = brushSize;

    // Carregar o SVG
    const urlParams = new URLSearchParams(window.location.search);
    const drawingName = urlParams.get('drawing') || 'casa_sacada';
    const drawingPath = `./assets/drawings/${drawingName}.svg`;

    let svgObject; // Variável para armazenar o objeto SVG

    fabric.loadSVGFromURL(drawingPath, (objects, options) => {
        if (!objects || objects.length === 0) throw new Error('SVG vazio ou inválido');

        svgObject = fabric.util.groupSVGElements(objects, {
            stroke: 'black',
            strokeWidth: 1,
            selectable: false,
            evented: false,
            opacity: imageTransparency // INICIALIZADO COM A TRANSPARÊNCIA DESEJADA PARA MARCA D'ÁGUA
        });

        canvas.add(svgObject);
        canvas.centerObject(svgObject);
        canvas.renderAll();
    });

    // Controle de transparência PRINCIPAL (100 a 0)
    transparencySlider.addEventListener('input', (e) => {
        const sliderValue = parseInt(e.target.value);
        transparencyValue.textContent = `${sliderValue}%`;

        // Converter slider (100-0) para opacidade do PINCEL (0-1)
        brushTransparency = sliderValue / 100;
        updateBrushColor();

        // Calcular a transparência da IMAGEM (0 a 95)
        imageTransparency = 1 - (sliderValue / 100 * 0.95); // Mapeia 0-100 para 0.05-1 (opacidade)

        // Aplicar na imagem
        if (svgObject) {
            svgObject.set('opacity', imageTransparency);
            canvas.renderAll();
        }
    });

    // Ferramentas
    document.getElementById('brush').addEventListener('click', () => {
        canvas.isDrawingMode = true;
        updateBrushColor();
    });

    document.getElementById('eraser').addEventListener('click', () => {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = 'rgba(255, 255, 255, 1)'; // Apagador sempre opaco
    });

    // Cor do pincel
    document.getElementById('color-picker').addEventListener('input', (e) => {
        brushColor = e.target.value;
        updateBrushColor();
    });

    // Tamanho do pincel
    document.getElementById('brush-size').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        canvas.freeDrawingBrush.width = brushSize;
        document.getElementById('brush-size-value').textContent = brushSize;
    });

    // Função para atualizar a cor do pincel com transparência
    function updateBrushColor() {
        canvas.freeDrawingBrush.color = hexToRgba(brushColor, brushTransparency);
    }

    // Baixar imagem (incluindo transparência)
    document.getElementById('download').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        link.download = `${drawingName}_colorido_${new Date().getTime()}.png`;
        link.click();
    });

    // Função auxiliar para converter HEX para RGBA
    function hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
});