

var EB = require("./eventbroadcaster");

var dataKey = "imageData";

var getData = function(){
    return JSON.parse(localStorage[dataKey]);
}

var setData = function(data){
    localStorage[dataKey] = JSON.stringify(data);
}

module.exports.appModel = {

    saveImageAt:function(index,title,data){
        var data = getData();
        data[index] = {title:title,data:data};
        setData(data);
    },
    getImageAt:function(index){
        return getData()[index];
    },
    getImageList:function(){
        var data = getData();
        var retList = [];
        for(var n = 0; n < data.length; n++) {
            returnList.push({index:n,title:data[n].title});
        }
        return retList;
    },
    deleteImageAt:function(index){
        var data = getData();
        data[index] = null;
        data.splice(index,1);
        setData(data);
        this.dispatchEvent("changed");// dispatch changed dispatchEvent
    }
};
