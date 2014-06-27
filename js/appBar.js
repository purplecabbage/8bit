
var appBar = {

    selectionColor: "#88C", // applied to the toolbar items
    nonSelectColor: "#000",

    init: function() {
        this.btns = document.querySelectorAll("#toolBar div");
        var onToolBtn = function(e) {
            appBar['on' + e.target.id](e);
            appBar.resetSelection();
        };
        for(var n = 0; n<this.btns.length; n++) {
            this.btns[n].addEventListener('click',onToolBtn);
        }
        this.selectedTool = this.btns[0];
        setTimeout(function(){
            onToolBtn({target:appBar.btns[0]});
        },0);
    },

    resetSelection: function resetSelection(tool) {
        var btns = this.btns;
        for(var n = 0; n<btns.length; n++) {
            btns[n].style.backgroundColor = this.nonSelectColor;
        }

        this.selectedTool.active = true;
        this.selectedTool.style.backgroundColor = this.selectionColor;
    },

    ontoolBtnDraw: function ontoolBtnDraw(e) {
        this.selectedTool = e.target;
    },

    ontoolBtnErase: function ontoolBtnErase(e) {
        this.selectedTool = e.target;
    },

    ontoolBtnMove: function ontoolBtnMove(e) {
        this.selectedTool = e.target;
    },

    ontoolBtnColor: function ontoolBtnColor(e) {
        if(e.target.active) {
            e.target.active = false;
            this.showColorPicker(false);
            e.target.style.backgroundColor = this.nonSelectColor;
            return;
        }
        else {
            e.target.active = true;
            e.target.style.backgroundColor = this.selectionColor;
            this.showColorPicker(true);
        }
    },

    showColorPicker: function showColorPicker(bShow) {
        if(clrPicker.children.length == 0) {
            this.createColorPicker();
        }

        if(bShow) {
            document.body.addEventListener("mouseup",this.removeSelection);
            document.body.addEventListener("touchend",this.removeSelection);
            clrPicker.style.display = "block";
        }
        else {
            document.body.removeEventListener("mouseup",this.removeSelection);
            document.body.removeEventListener("touchend",this.removeSelection);
            clrPicker.style.display = "none";
        }
    },

    ontoolBtnZoom: function ontoolBtnZoom(e) {
        if(e.target.active) {
            e.target.active = false;
            this.showZoomControls(false);
            e.target.style.backgroundColor = this.nonSelectColor;
        }
        else {
            e.target.active = true;
            this.showZoomControls(true);
            e.target.style.backgroundColor = this.selectionColor;
        }
    },


    showZoomControls: function showZoomControls(bShow) {
        if(bShow) {
            document.body.addEventListener("mouseup",this.removeSelection);
            document.body.addEventListener("touchend",this.removeSelection);
            zoomBar.style.display = "table";
        }
        else {
            document.body.removeEventListener("mouseup",this.removeSelection);
            document.body.removeEventListener("touchend",this.removeSelection);
            zoomBar.style.display = "none";
        }
    },

    enableUndoBtn: function enableUndoBtn(bEnable) {
        toolBtnUndo.enabled = bEnable;
    },

    removeSelection: function removeSelection() {

        toolBtnColor.style.backgroundColor = "#000";
        setTimeout(function(){
            toolBtnColor.active = false;
            appBar.showColorPicker(false);
            toolBtnZoom.active = false;
            appBar.showZoomControls(false);
        },10);
    },

    createColorPicker: function createColorPicker() {
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
            
        for(var n = 0; n < colors.length; n++) {
            var elem = document.createElement("div");
            elem.style.backgroundColor = colors[n];
            clrPicker.appendChild(elem);
        }
    }
}
