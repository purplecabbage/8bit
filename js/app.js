
// icons:: https://www.iconfinder.com/search/?q=iconset:jigsoar-icons


(function(exports){

        var startX,startY,currentTarget,selectedIndex = 0;
        var currentCanvas;
        var context;
        var toolActive = false;
        var wasPenDrag = false;
        var wasMove = false;
        var currentColor = "#FFF";
        var selectedTool;

        var selectionColor = "#884466"; // applied to the toolbar items
        var nonSelectColor = "#000";

        var pixelData;
        var defaultPixelSize = 8;
        var zoomRatio = 1.0;
        var canvasWidth = 120; // in pixels
        var canvasHeight = 160; // in pixels

        var maxZoom = 8;
        var minZoom = 1;

        var offsetX = 0;
        var offsetY = 0;

        var undoStack = [];

        exports.init = function () {
            
            initCanvas();
            initAppBar();

            window.addEventListener("resize",debounce(onResize,200));

        }

        function onResize(){
            
        }

        function initAppBar() {

            setCurrentColor(getCurrentColor());

            var btns = document.querySelectorAll("#toolBar div");
            for(var n = 0; n<btns.length; n++) {
                btns[n].addEventListener('click',onToolBtn);
            }
            
            onToolBtn({target:btns[0]});
            clrPicker.onclick = onColorPicker;

            divZoomOut.addEventListener("click",function(){
                doZoom(-1);
            });

            divZoomIn.addEventListener("click",function(){
                doZoom(1);
            });

            zoomVal.innerText = zoomRatio;
        }

        function getPixelSize() {
            return defaultPixelSize;// * zoomRatio;
        }

        function initCanvas() {

            currentCanvas = drawCanvas
            context = currentCanvas.getContext('2d');
            context.width = canvasWidth;
            context.height = canvasHeight;
            
            clearCanvas();

            canvasHolder.addEventListener("pointerdown",onToolStart);
            canvasHolder.addEventListener("pointermove", onToolMove);
            document.addEventListener("pointerup",  onToolEnd);
            canvasHolder.addEventListener("click",  onToolClick);
        }

        function clearCanvas() {
            pixelData = [];
            for(var i = 0; i < canvasWidth; i++) {
                    pixelData[i] = [];
                for(var j = 0; j < canvasHeight; j++) {
                    pixelData[i][j] = 0;
                }
            }
            redraw();
        }

        function redraw() {

            offsetX = Math.max(offsetX,0);
            offsetY = Math.max(offsetY,0);

            context.clearRect(0,0,canvasWidth,canvasHeight);
            context.fillStyle = "#000";
            //context.strokeStyle = "#333";
            context.beginPath();

            var pxSz = getPixelSize();
            var pX = Math.ceil(canvasWidth / pxSz);
            var pY = Math.ceil(canvasHeight / pxSz);

            console.log("pX = " + pX);

            for (var x = 0; x < canvasWidth; x++) {
                // if pixel x is offscreen, skip it

                for (var y = 0; y < canvasHeight; y++) {
                    var adjX = x - offsetX;
                    var adjY = y  - offsetY;

                    // if pixel.y is onscreen, draw it
                    // if it has pixel data, fill it, otherwise draw the grid
                    if(pixelData[x][y]) {
                        context.fillStyle = pixelData[x][y];
                    }
                    else {
                        context.fillStyle = ( (x % 2 ^ y % 2) ? "#000" : "#333");
                    }
                    
                    context.fillRect(adjX * pxSz, adjY * pxSz, pxSz, pxSz);
                    //context.strokeRect(adjX * pxSz, adjY * pxSz, pxSz, pxSz);
                }
            }
            //context.stroke();
            context.closePath();
        }

        function drawPixel( ) {

        }

        function exportImage() {

            var mux = 20;

            var tempCanvas = document.createElement("canvas");
            tempCanvas.width = pixelData.length * mux;
            tempCanvas.height = pixelData[0].length * mux;

// Not required to export data, but a HUD might be nice ...
/*
            tempCanvas.style.position = "absolute";
            tempCanvas.style.right = "0px";
            tempCanvas.style.top = "0px";
            document.body.appendChild(tempCanvas);
*/
            var ctx = tempCanvas.getContext('2d');

            // if we want a background color, it should go here ...
            //ctx.clearRect(0, 0, pixelData.length * mux, pixelData[0].length * mux);

            ctx.lineCap = "square";
            ctx.lineJoin = "miter";
            ctx.beginPath();
            for (var x = 0; x < pixelData.length; x++) {
                for (var y = 0; y < pixelData[x].length; y++) {
                    
                    if (pixelData[x][y] != 0) {
                        ctx.fillStyle = pixelData[x][y];
                        ctx.fillRect(x * mux, y * mux, mux, mux);
                    }
                }
            }

            ctx.closePath();
            
            var imgData = tempCanvas.toDataURL("image/png", "");

            // are we in a cordova app with a saveImageToCameraRoll method?
            try {
                window.device.saveImageDataToCameraRoll(null,null,tempCanvas.toDataURL());
            }
            catch(e) {
                window.open(imgData);
            }
        }
        
        function onToolBtn(e)
        {

            var btns = document.querySelectorAll("#toolBar div");
            for(var n = 0; n<btns.length; n++) {
                btns[n].style.backgroundColor = nonSelectColor;
            }

            switch(e.target.id) {
                case "toolBtnMove" : 
                    selectedTool = e.target;
                    break;
                case "toolBtnUndo" : 
                    // undo tool should not affect the active tool, it is an action
                    doUndoable();
                    break;
                case "toolBtnColor" : 
                    if(e.target.active) {
                        e.target.active = false;
                        showColorPicker(false);
                        e.target.style.backgroundColor = nonSelectColor;
                        return;
                    }
                    else {
                        e.target.active = true;
                        e.target.style.backgroundColor = selectionColor;
                        showColorPicker(true);
                    }
                    break;
                case "toolBtnExport":
                    exportImage();
                    break;
                case "toolBtnSettings": 
                    break;
                case "toolBtnDraw" : 
                    selectedTool = e.target;
                    break;
                case "toolBtnErase" : 
                    selectedTool = e.target;
                    break;                    
                case "toolBtnDelete" : 
                    // delete all does not affect the current tool
                    clearCanvas();
                    break;
                case "toolBtnZoom" :
                    if(e.target.active) {
                        e.target.active = false;
                        showZoomControls(false);
                        e.target.style.backgroundColor = nonSelectColor;
                    }
                    else {
                        e.target.active = true;
                        showZoomControls(true);
                        e.target.style.backgroundColor = selectionColor;
                    }
                    break;
            }

            selectedTool.active = true;
            selectedTool.style.backgroundColor = selectionColor;
        
        }

        function showZoomControls(bShow) {
            if(bShow) {
                //document.body.addEventListener("mouseup",removeSelection);
                zoomBar.style.display = "table";
            }
            else {
                //document.body.removeEventListener("mouseup",removeSelection);
                zoomBar.style.display = "none";
            }
        }

        function doZoom(dir) {

            zoomRatio += dir;
            
            if(zoomRatio > maxZoom) {
                zoomRatio = minZoom;
            }
            else if(zoomRatio < minZoom) {
                zoomRatio = maxZoom;
            }
            zoomVal.innerText = zoomRatio;
            //redraw();
            drawCanvas.style.webkitTransform = "scale(" + zoomRatio +  ")";
        }

        function getCurrentColor() {
            return window.localStorage.currentColor || "#FF0F0F";
        }

        function setCurrentColor(clr) {
            window.localStorage.currentColor = clr;
            toolBtnColor.style.borderColor = currentColor;
        }

        function onColorPicker(evt) {
            toolBtnColor.active = false;
            // use the bg color of the touched div
            setCurrentColor(evt.target.style.backgroundColor);
            
            showColorPicker(false);

        }

        function removeSelection() {
            toolBtnColor.style.backgroundColor = "#000";
            setTimeout(function(){
                showColorPicker(false);
                showZoomControls(false);
            },10);
        }

        function createColorPicker() {
            var pre = [0,128,256];
            var colors = [];
            var stride = pre.length;

            for(var b = 0; b < stride; b++) {
                for(var g = 0; g < stride; g++) {
                    for(var r = 0; r < stride; r++) {
                        colors.push("rgba(" + pre[r] + "," + pre[g] + "," + pre[b] + ",1.0)");
                        colors.push("rgba(" + pre[r]/2 + "," + pre[g]/2 + "," + pre[b] /2+ ",1.0)");  
                    }
                }
            }

            colors = colors.filter(function(elem, pos) {
                return colors.indexOf(elem) == pos;
            });

            colors.sort();
            console.log("colors.length = " + colors.length);
                
            for(var n = 0; n < colors.length; n++) {
                var elem = document.createElement("div");
                elem.style.backgroundColor = colors[n];
                clrPicker.appendChild(elem);
            }
        }
        
        function showColorPicker(bShow)
        {
            if(clrPicker.children.length == 0) {
                createColorPicker();
            }

            if(bShow) {
                document.body.addEventListener("mouseup",removeSelection);
                clrPicker.style.display = "block";
            }
            else {
                document.body.removeEventListener("mouseup",removeSelection);
                clrPicker.style.display = "none";
            }
        }

        //returns true if the color value has changed
        function setPixelColor(x,y,clr,noUndo) {
            // ignore if the pixel is not changing colors.
            if(pixelData[x][y] != clr) {
                if (!noUndo) {
                    undoStack.push({ x: x, y: y, clr: pixelData[x][y] });
                }
                pixelData[x][y] = clr;
                return true;
            }
            return false;
        }

        function doUndoable() {
            var obj = undoStack.pop();
            if (obj) {

                setPixelColor(obj.x, obj.y, obj.clr, true);
                // store current context.color
                var currentColor = context.fillStyle;
                context.fillStyle = obj.clr || ( ( ( obj.x - offsetX) % 2 ^ (obj.y - offsetY) % 2) ? "#000" : "#333")

                var pxSz = getPixelSize();

                context.beginPath();
                context.fillRect(obj.x * pxSz, obj.y * pxSz, pxSz, pxSz);
                context.closePath();
                context.fillStyle = currentColor; // restore currentColor

                if (undoStack.length < 1) {
                       // TODO: disable undo btn
                }
            }

        }

        function onToolStart(e) {
            toolActive = true;
            var pxSz = getPixelSize();

            var x = Math.floor( e.offsetX / pxSz );
            var y = Math.floor( e.offsetY / pxSz );

            startX = -1;//x;
            startY = -1;//y;

            wasPenDrag = false;

            if(selectedTool == toolBtnMove) {
                
            }
            else if(selectedTool == toolBtnErase) {
                e.preventDefault();
                context.save();
                context.beginPath();
            }
            else { // default is the pen tool
                e.preventDefault();
                context.save();

                context.fillStyle = getCurrentColor();
                
                context.beginPath();
            }
        }

        function onToolClick(e) {

            if(!wasPenDrag) { // dragging the pen also fills pixels, so we ignore click events if the 'pen' moved
                var pxSz = getPixelSize();

                var x = Math.floor( e.offsetX / pxSz );
                var y = Math.floor( e.offsetY / pxSz );

                if(selectedTool == toolBtnErase) {

                    var fillStyle = context.fillStyle;
                    context.fillStyle = ( (x % 2 ^ y % 2) ? "#000" : "#333");
                    setPixelColor(x, y, 0);
                    context.beginPath();
                    context.fillRect(x * pxSz, y * pxSz, pxSz, pxSz);
                    //context.strokeRect(x * pxSz, y * pxSz, pxSz, pxSz);
                    context.closePath();
                    context.fillStyle = fillStyle;
                }
                else if(selectedTool == toolBtnMove) {

                }
                else {
                    context.beginPath();
                    context.fillRect(x * pxSz, y * pxSz, pxSz, pxSz);
                    //context.strokeRect(x * pxSz, y * pxSz, pxSz, pxSz);
                    setPixelColor(x, y, context.fillStyle);
                    //context.stroke();
                    context.closePath();
                }
            }
        }

        function onToolMove(e) {
            // need tool active for mouse-move support
            if(!toolActive) {
                return;
            }

            var pxSz = getPixelSize();
            var x = Math.floor( e.offsetX / pxSz );
            var y = Math.floor( e.offsetY / pxSz );

            if(selectedTool == toolBtnMove) {
                if(x != startX || y != startY) {
                    offsetX -= x - startX;
                    offsetY -= y - startY;
                    //redraw();
                    currentCanvas.style.left = -offsetX + "px";
                    currentCanvas.style.top = -offsetY + "px";
                }
                startX = x;
                startY = y;
            }
            else if(selectedTool == toolBtnErase) {
                e.preventDefault();
                if(x != startX || y != startY) {
                    if(setPixelColor(offsetX + x, offsetY + y, 0)) {
                        context.fillStyle = ( (x % 2 ^ y % 2) ? "#000" : "#333");
                        context.fillRect(x * pxSz,y*pxSz,pxSz,pxSz);
                    }
                    wasPenDrag = true;
                }

                startX = x;
                startY = y;
            }
            else {
                
                e.preventDefault();
                if(x != startX || y != startY) {
                    context.fillRect(x * pxSz,y*pxSz,pxSz,pxSz);
                    setPixelColor(offsetX + x, offsetY + y, context.fillStyle);
                    wasPenDrag = true;
                }

                startX = x;
                startY = y;

            }
        }

        function onToolEnd(e) {
            toolActive = false; 
            startX = -1;
            startY = -1;

            if(selectedTool == toolBtnMove) {

            }
            else {
                e.preventDefault();
                context.closePath(); // finish drawing
            }

        }

})(window);
