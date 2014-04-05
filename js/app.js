
// icons:: https://www.iconfinder.com/search/?q=iconset:jigsoar-icons


(function(exports){

        var canvasList = [];
        var startX,startY,currentTarget,selectedIndex = 0;
        var currentCanvas;
        var context;
        var toolActive = false;
        var wasMove = false;
        var currentColor = "#FFF";
        var selectedTool;

        var pixelData;
        var defaultPixelSize = 8;
        var zoomRatio = 8.0;
        var canvasWidth = 120;
        var canvasHeight = 160;

        var offsetX = 0;
        var offsetY = 0;

        var undoStack = [];

        exports.init = function () {
            
            initCanvas();
            initAppBar();
        }

        function initAppBar() {

            setCurrentColor(getCurrentColor());

            var btns = document.querySelectorAll("#toolBar div");
            for(var n = 0; n<btns.length; n++) {
                btns[n].addEventListener('click',onToolBtn);
            }
            
            onToolBtn({target:btns[0]});
            clrPicker.onclick = onColorPicker;
        }

        function getPixelSize() {
            return defaultPixelSize * 1;//zoomRatio;
        }

        function initCanvas() {

            canvasList.push(drawCanvas);
            currentCanvas = canvasList[0];
            context = currentCanvas.getContext('2d');
            context.width = canvasWidth;
            context.height = canvasHeight;
            
            clearCanvas();

            canvasHolder.addEventListener("pointerdown",onToolStart);
            canvasHolder.addEventListener("pointermove", onToolMove);
            canvasHolder.addEventListener("pointerup",  onToolEnd);
            canvasHolder.addEventListener("click",  onToolClick);
        }

        function clearCanvas(clr) {
            pixelData = [];
            for(var i = 0; i < canvasWidth / 2; i++) {
                    pixelData[i] = [];
                for(var j = 0; j < canvasHeight / 2; j++) {
                    pixelData[i][j] = 0;
                }
            }
            redraw(clr);
        }

        function redraw() {

            offsetX = Math.max(offsetX,0);
            offsetY = Math.max(offsetY,0);

            context.clearRect(0,0,canvasWidth,canvasHeight);
            context.fillStyle = "#000";
            context.strokeStyle = "#333";
            context.beginPath();

            var pxSz = getPixelSize();
            var pX = Math.ceil(canvasWidth / pxSz);
            var pY = Math.ceil(canvasHeight / pxSz);

            var xCount = pixelData.length;
            var yCount = pixelData[0].length;

            console.log("xCount = " + xCount);

            for (var x = 0; x < xCount; x++) {
                for (var y = 0; y < yCount; y++) {
                    var adjX = x;// - offsetX;
                    var adjY = y;// - offsetY;

                    context.fillStyle = pixelData[x][y] || ( (x % 10 == 0 || y % 10 == 0) ? "#111" : "#000");
                    context.fillRect(adjX * pxSz, adjY * pxSz, pxSz, pxSz);
                    context.strokeRect(adjX * pxSz, adjY * pxSz, pxSz, pxSz);
                }
            }
            context.stroke();
            context.closePath();
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
            for(var n = 0; n<btns.length; n++)
            {
                btns[n].style.backgroundColor = "Black";
            }

            switch(e.target.id) 
            {
                case "toolBtnMove" : 
                    selectedTool = e.target;
                    break;
                case "toolBtnUndo" : 
                    doUndoable();
                    break;
                case "toolBtnColor" : 
                    if(e.target.active) {
                        e.target.active = false;
                        showColorPicker(false);
                        return;
                    }
                    showColorPicker(true);
                    break;
                case "toolBtnExport":
                    exportImage();
                    break;
                case "toolBtnSettings": 
                    break;
                case "toolBtnDraw" : 
                    selectedTool = e.target;
                    break;
                case "toolBtnDelete" : 
                    clearCanvas();
                    break;
                case "toolBtnZoom" :
                    selectedTool = e.target; 
                    doZoom();
                    break;
                
                
            }

            e.target.active = true;
            e.target.style.backgroundColor = "#884466";
        
        }

        function doZoom() {
            zoomRatio *= 1.5;
            if(zoomRatio > 32) {
                zoomRatio = 1.0;
            }
            redraw();
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
            setCurrentColor(evt.target.style.backgroundColor);
            
            showColorPicker(false);

            selectedTool.active = true;
            selectedTool.style.backgroundColor = "#884466";
        }

        function removeSelection() {
            toolBtnColor.style.backgroundColor = "#000";
            setTimeout(function(){
                showColorPicker(false);
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
            if(bShow) {
                document.body.addEventListener("mouseup",removeSelection);
                clrPicker.style.display = "block";
            }
            else {
                document.body.removeEventListener("mouseup",removeSelection);
                clrPicker.style.display = "none";
            }

            if(clrPicker.children.length == 0) {
                createColorPicker();
            }
        }

        function updateDebugText(x,y)
        {
            //toolBar.innerText = startX + "," + startY + "," + x + "," + y;
        }

        function setPixelColor(x,y,clr,noUndo) {

            if (!noUndo) {
                undoStack.push({ x: x, y: y, clr: pixelData[x][y] });
            }
            pixelData[x][y] = clr;
        }

        function doUndoable() {
            var obj = undoStack.pop();
            if (obj) {

                setPixelColor(obj.x, obj.y, obj.clr, true);
                // store current context.color
                var currentColor = context.fillStyle;
                context.fillStyle = obj.clr || "#000";

                var pxSz = getPixelSize();

                context.beginPath();
                context.fillRect(obj.x * pxSz, obj.y * pxSz, pxSz, pxSz);
                context.strokeRect(obj.x * pxSz, obj.y * pxSz, pxSz, pxSz);
                context.stroke();
                context.closePath();
                // restore current context.color
                context.fillStyle = currentColor;

                if (undoStack.length < 1) {
                       // TODO: disable undo btn
                }
            }

        }

        function onToolStart(e) {
            toolActive = true;
            var pxSz = getPixelSize();
            var x = Math.floor(( e.pageX - currentCanvas.offsetLeft ) / pxSz );
            var y = Math.floor(( e.pageY - currentCanvas.offsetTop ) / pxSz );
            startX = x;
            startY = y;

            if(selectedTool == toolBtnMove) {
                
            }
            else {
                e.preventDefault();
                context.save();

                context.fillStyle = getCurrentColor();
                
                wasPenDrag = false;
                context.beginPath();
            }
        }

        function onToolClick(e) {
            if(!wasPenDrag) {

                var pxSz = getPixelSize();
                var x = Math.floor(( e.pageX - currentCanvas.offsetLeft ) / pxSz );
                var y = Math.floor(( e.pageY - currentCanvas.offsetTop ) / pxSz );

                context.beginPath();
                context.fillRect(x * pxSz, y * pxSz, pxSz, pxSz);
                context.strokeRect(x * pxSz, y * pxSz, pxSz, pxSz);
                setPixelColor(x, y, context.fillStyle);
                context.stroke();
                context.closePath();
            }
        }

        function onToolMove(e) {
            if(!toolActive) {
                return;
            }

            var pxSz = getPixelSize();
            var x = Math.floor(( e.pageX - currentCanvas.offsetLeft ) / pxSz );
            var y = Math.floor(( e.pageY - currentCanvas.offsetTop ) / pxSz );

            if(selectedTool == toolBtnMove) {

                if(x != startX || y != startY) {
                    offsetX -= x - startX;
                    offsetY -= y - startY;
                    redraw();
                }
                startX = x;
                startY = y;
            }
            else {
                
                e.preventDefault();


                if(x != startX || y != startY) {
                    context.fillRect(x * pxSz,y*pxSz,pxSz,pxSz);
                    context.strokeRect(x * pxSz, y * pxSz, pxSz, pxSz);
                    setPixelColor(offsetX + x, offsetY + y, context.fillStyle);
                    wasPenDrag = true;
                }

                context.stroke();
                startX = x;
                startY = y;

                updateDebugText(x,y);
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
                context.closePath();
            }

        }

})(window);
