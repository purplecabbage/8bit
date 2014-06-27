
var appBar = {

    selectionColor: "#88C", // applied to the toolbar items
    nonSelectColor: "#000",

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

    ontoolBtnDelete: function ontoolBtnDelete(e) {
        // delete all does not affect the current tool
        clearCanvas();
        redraw();
    },

    ontoolBtnExport: function ontoolBtnExport(e) {
        exportImage();
    },

    ontoolBtnUndo: function ontoolBtnUndo(e) {
        undoSet();
    },

    ontoolBtnSave: function ontoolBtnSave(e) {
        saveImage();
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

    showColorPicker: function showColorPicker(bShow) {
        if(clrPicker.children.length == 0) {
            createColorPicker();
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
    }
}