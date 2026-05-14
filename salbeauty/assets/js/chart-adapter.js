const chartRegistry = {}

function getChartByKey(key){
    return chartRegistry[key] || null
}

function ensureChart(config){
    const {
        key,
        elementId,
        type,
        data,
        options,
        plugins
    } = config || {}

    if(!key || !elementId || !type){
        return null
    }

    const canvas = document.getElementById(elementId)
    if(!canvas || typeof Chart === 'undefined'){
        return null
    }

    const existing = getChartByKey(key)

    if(existing){
        existing.config.type = type
        existing.data = data
        existing.options = options
        existing.update('none')
        return existing
    }

    chartRegistry[key] = new Chart(canvas, {
        type,
        data,
        options,
        plugins
    })

    return chartRegistry[key]
}

function updateChart(key, payload){
    const instance = getChartByKey(key)
    if(!instance || !payload){
        return null
    }

    if(payload.data){
        instance.data = payload.data
    }

    if(payload.options){
        instance.options = payload.options
    }

    if(payload.type){
        instance.config.type = payload.type
    }

    instance.update(payload.mode || 'none')
    return instance
}

function destroyChart(key){
    const instance = getChartByKey(key)
    if(!instance){
        return
    }

    instance.destroy()
    delete chartRegistry[key]
}

function destroyAllCharts(){
    Object.keys(chartRegistry).forEach(destroyChart)
}
