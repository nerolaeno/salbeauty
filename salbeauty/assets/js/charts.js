function renderChartByConfig(key, elementId, configBuilder, data){
    if(typeof ensureChart !== 'function' || typeof configBuilder !== 'function'){
        return null
    }

    const config = configBuilder(Array.isArray(data) ? data : [])
    return ensureChart({
        key,
        elementId,
        type:config.type,
        data:config.data,
        options:config.options,
        plugins:config.plugins
    })
}

function renderTopBeautyChart(data){
    return renderChartByConfig('categoryChart', 'categoryChart', buildTopBeautyConfig, data)
}

function renderSkinMatchChart(data){
    return renderChartByConfig('skinChart', 'skinChart', buildSkinMatchConfig, data)
}

function renderBrandChart(data){
    return renderChartByConfig('brandChart', 'brandChart', buildBrandConfig, data)
}

function renderValueChart(data){
    return renderChartByConfig('priceChart', 'priceChart', buildValueConfig, data)
}

function renderTrendingChart(data){
    return renderChartByConfig('topProductChart', 'topProductChart', buildTrendingConfig, data)
}

function renderIngredientChart(data){
    return renderChartByConfig('ingredientChart', 'ingredientChart', buildIngredientConfig, data)
}

function renderPriceQualityChart(data){
    return renderChartByConfig('dssChart', 'dssChart', buildPriceQualityConfig, data)
}

function renderSatisfactionChart(data){
    return renderChartByConfig('ratingChart', 'ratingChart', buildSatisfactionConfig, data)
}
