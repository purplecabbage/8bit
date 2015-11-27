

var EB = EventBroadcaster;//require("./eventbroadcaster");

var dataKey = "imageDataKey";

var getData = function(){
    var raw = localStorage[dataKey];
    return raw ? JSON.parse(raw) : [];
}

var setData = function(data){
    localStorage[dataKey] = JSON.stringify(data);
}

var appModel = {

    saveImageAt:function(index,title,_data){
        var store = getData();
        store[index] = {title:title,data:_data};
        setData(store);
    },
    getImageAt:function(index){
        var all = getData();
        return all && all[index] ? all[index] : null;
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
