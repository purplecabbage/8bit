
var appBar = {

    resetSelection: function resetSelection(tool) {
        var btns = this.btns;
        for(var n = 0; n<btns.length; n++) {
            btns[n].style.backgroundColor = nonSelectColor;
        }

        this.selectedTool.active = true;
        this.selectedTool.style.backgroundColor = selectionColor;
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
            showColorPicker(false);
            e.target.style.backgroundColor = nonSelectColor;
            return;
        }
        else {
            e.target.active = true;
            e.target.style.backgroundColor = selectionColor;
            showColorPicker(true);
        }
    },

    ontoolBtnZoom: function ontoolBtnZoom(e) {
        if(e.target.active) {
            e.target.active = false;
            this.showZoomControls(false);
            e.target.style.backgroundColor = nonSelectColor;
        }
        else {
            e.target.active = true;
            this.showZoomControls(true);
            e.target.style.backgroundColor = selectionColor;
        }
    },


    showZoomControls: function showZoomControls(bShow) {
        if(bShow) {
            document.body.addEventListener("mouseup",removeSelection);
            document.body.addEventListener("touchend",removeSelection);
            zoomBar.style.display = "table";
        }
        else {
            document.body.removeEventListener("mouseup",removeSelection);
            document.body.removeEventListener("touchend",removeSelection);
            zoomBar.style.display = "none";
        }
    }

}