// Define globals
var masterChart;
var masterData;
var masterId;
var masterXLabels = {
    "missing" : "Number of HCCs with Error Type - Missing medical record",
    "coding" : "Number of HCCs with Error Type - Coding/Incomplete",
    "signcred" : "Number of HCCs with Error Type - Missing signature AND/OR unable to determine credential to confirm physician specialty",
    "invalid" : "Number of HCCs with Error Type - Other - invalid records",
}

var masterYLabels = {
    "tot_pmterr" : "Net Payment Error",
    "tot_gross_pmterr" : "Gross Payment Error"
}
// Not supported on IE Explorer 8


Array.prototype.moveEleFromIndexToIndex = function (old_index, new_index) {
    while (old_index < 0) {
        old_index += this.length;
    }
    while (new_index < 0) {
        new_index += this.length;
    }
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

function grouped_stacked_bar_display(dataUrl, barId) {
	d3.json(dataUrl, function(error, data) {
	    addThatGraph(data, barId)
	});
}

function updateSortByFields(data) {
    keyList = ["Key"]
    for (var i = 0; i < data.length; i++) {
        keyList.push(data[i].key)
    }
    var selection = document.getElementById("sortby")
    var currentOptions = selection.options;
    currentList = []
    for (var i = 0; i < currentOptions.length; i++) {
        currentList.push(currentOptions[i].value)
    }

    // Determine if we should be updating it at all
    // Sort both
    originalOrderedCurrentList = currentList.slice()
    currentList = currentList.sort()
    keyList = keyList.sort()

    var is_same = (keyList.length == currentList.length) && keyList.every(function(element, index) {
           return element === currentList[index]; 
    });
    if (!is_same) {
        // I need to find the index
        for (var i = 0; i < currentList.length; i++) {
            currentOptions.remove(0)
        }
        var keyOption = document.createElement("option")
        keyOption.text="Key"
        keyOption.value="Key"
        currentOptions.add(keyOption)
        for (var i = 0; i < data.length; i++) {
            var opt = document.createElement("option")
            opt.text=data[i].key
            opt.value=data[i].key
            currentOptions.add(opt)
        }
    }
}

function removeAllOptions(options) {
    for (var i = 0; i < options.length; i++) {
        options.remove(0)
    }
}

function addAllOptions(options, arr) {
    for (var i = 0; i < arr.length; i++) {
        var opt = document.createElement("option")
        opt.text = arr[i]
        opt.value = arr[i]
        options.add(opt)
    }
}

function updateQuantitativeView() {
    var selection = document.getElementById("payorcount")
    var value = selection.value
    var arr = []
    if (value == "payment") {
        arr = ["Yes", "No", "Hello"]
    } else {
        arr = ["Smart", "Silly", "All"]
    }
    var optionsToUpdate = document.getElementById("quantitativeview").options
    removeAllOptions(optionsToUpdate)
    addAllOptions(optionsToUpdate, arr)
}

function updateFactorView() {
    var disease_factor_choosable = []

    var selection = document.getElementById("quantitativeview")
    var value = selection.value

}

function updateUrl() {
    var sample = document.getElementById("sampleselector").value
    var category = document.getElementById("categoryselector").value
    var analysis = document.getElementById("analysisselector").value
    var method = document.getElementById("methodselector").value
    var file_name = "data/" +
                    sample + "_" + category + "_" + analysis + "_" + method +
                    ".json"
    // var file_name = "../BarPlotNVD_V2/data/" +
    //                  sample+"_"+category+"_"+analysis+".json"
    console.log("Loaded " + file_name)
    removeChart()
    grouped_stacked_bar_display(file_name, masterId)
}

function addThatGraph(data, barId) {
    // Update the sortby fields
    updateSortByFields(data)
    // Sort so it initially makes sense
    data = indirectedSort2(data)
    nv.addGraph({
            generate: function() {
                // var width = nv.utils.windowSize().width,
                    // height = nv.utils.windowSize().height;
                var chart = nv.models.multiBarChart()
                    // .width(width)
                    // .height(height)
                    .showLegend(false)
                    .showControls(false)
                    .stacked(true)
                    .reduceXTicks(false)
                    .rotateLabels(0)
                    ;
                chart.margin({
                    left: 150,
                    bottom: 150,
                    right: 100
                })
                chart.yAxis.tickFormat(d3.format('.1f'))
                x_label = document.getElementById("categoryselector").value
                chart.xAxis
                    .axisLabel(masterXLabels[x_label])

                y_label = document.getElementById("analysisselector").value
                chart.yAxis
                    .axisLabel(masterYLabels[y_label])
                // Use the below to control the top
                // chart.legend.margin({top:50})

                chart.dispatch.on('renderEnd', function(){
                    console.log('Render Complete');
                    masterChart = chart
                    masterData = data
                    masterId = barId

                });
				var chartData = d3.select(barId).append('svg').datum(data);
                chartData.transition().duration(0).call(chart);
                // Update after transitions
                nv.utils.windowResize(chart.update);
                return chart;
            }, 
        });
}


function removeChart(){
    d3.select('#groupedstackedbar svg').remove();
}

function wrapperPerformIndirectSort() {
    removeChart(masterId)
    addThatGraph(masterData, masterId)
}

function indirectedSort2(data) {
        // Internal shorthand helper functions
        /* A shorthand function */
        var descendingComparator = function(arr, key) {
            return function(a, b) {
                var aHeight = arr[a][key]
                var bHeight = arr[b][key]
                if (typeof(aHeight) == "string" && aHeight.toLowerCase().indexOf("hcc") > -1) {
                    var numStringOnlyA = aHeight.replace( /^\D+/g, '')
                    var numStringOnlyB = bHeight.replace( /^\D+/g, '')
                    aHeight = parseInt(numStringOnlyA)
                    bHeight = parseInt(numStringOnlyB)
                }
                if (!isNaN(aHeight) && !isNaN(bHeight)) {
                    aHeight = parseInt(aHeight)
                    bHeight = parseInt(bHeight)
                }
                return ((aHeight < bHeight) ? 1 : ((aHeight > bHeight) ? -1 : 0));
                //return ((arr[a] < arr[b]) ? -1 : ((arr[a] > arr[b]) ? 1 : 0));
            };
        };

        var ascendingComparator = function(arr, key) {
            return function(a, b) {
                var aHeight = arr[a][key]
                var bHeight = arr[b][key]
                if (typeof(aHeight) == "string" && aHeight.toLowerCase().indexOf("hcc") > -1) {
                    var numStringOnlyA = aHeight.replace( /^\D+/g, '')
                    var numStringOnlyB = bHeight.replace( /^\D+/g, '')
                    aHeight = parseInt(numStringOnlyA)
                    bHeight = parseInt(numStringOnlyB)
                }
                if (!isNaN(aHeight) && !isNaN(bHeight)) {
                    aHeight = parseInt(aHeight)
                    bHeight = parseInt(bHeight)
                }
                //return ((aHeight < bHeight) ? 1 : ((aHeight > bHeight) ? -1 : 0));
                return ((aHeight < bHeight) ? -1 : ((aHeight > bHeight) ? 1 : 0));
            };
        };
        // End internal shorthand helper functions
        var keyList = []
        var valuesList = []
        for (var i = 0; i < data.length; i++) {
            keyList.push(data[i].key)
            valuesList.push(data[i].values)
        }
        var order = document.getElementById("order").value;
        var sortby = document.getElementById("sortby").value;
        var base = sortby
        if (sortby == "Key") {
            base = data[0].key
        }

        var keyIndexSortBy = keyList.indexOf(sortby)
        var idx = [];
        var dataDictKeyToSortBy = "y";
        if (sortby == "Key") {
            keyIndexSortBy = 0;
            dataDictKeyToSortBy = "x"
        }

        /* Array of indices */
        for (var i = 0; i < valuesList[keyIndexSortBy].length; i++) {
            idx.push(i)
        }

        /* Sort by the series we want to sort by */
        if (order === "Ascending") {
            idx = idx.sort(ascendingComparator(valuesList[keyIndexSortBy], dataDictKeyToSortBy))
        }
        if (order === "Descending") {
            idx = idx.sort(descendingComparator(valuesList[keyIndexSortBy], dataDictKeyToSortBy))
        }

        for(var i = 0; i < valuesList.length; i++) {
            var temp = [];
            var currentList = valuesList[i];
            for (j = 0; j < idx.length; j++) {
                temp.push(currentList[idx[j]])
            }
            valuesList[i] = temp;
        }

        // Now I need to update the masterData
        for (var i = 0; i < data.length; i++) {
            data[i].values = valuesList[i];
        }

        // Update the base
        var baseSelectionIndex = keyList.indexOf(base)

        data.moveEleFromIndexToIndex(baseSelectionIndex,0);

        return data;

}