const beautyPalette = [
    '#F8B8C8',
    '#EFA6B8',
    '#E7D7F0',
    '#F4D8C8',
    '#F5E6DB',
    '#F8DDE4'
]

function chartToNumber(value){
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

const USD_TO_IDR = 16000

function chartUsdToIdr(value){
    return chartToNumber(value) * USD_TO_IDR
}

function chartFormatPrice(value){
    return new Intl.NumberFormat('id-ID', {
        style:'currency',
        currency:'IDR',
        maximumFractionDigits:0
    }).format(chartToNumber(value))
}

function createCommonOptions(extra = {}){
    return {
        responsive:true,
        maintainAspectRatio:false,
        plugins:{
            legend:{
                display:false,
                labels:{
                    usePointStyle:true,
                    color:'#7b6c74'
                }
            },
            tooltip:{
                backgroundColor:'rgba(255,255,255,0.97)',
                titleColor:'#2B2B2B',
                bodyColor:'#555',
                borderColor:'rgba(240,98,146,0.16)',
                borderWidth:1,
                padding:12,
                cornerRadius:14,
                displayColors:false
            }
        },
        scales:{
            x:{
                grid:{ color:'rgba(240,98,146,0.08)' },
                ticks:{ color:'#7b6c74' }
            },
            y:{
                grid:{ color:'rgba(240,98,146,0.06)' },
                ticks:{ color:'#7b6c74' }
            }
        },
        ...extra
    }
}

function paletteFor(length, offset = 0){
    return Array.from({length}, (_, index) =>
        beautyPalette[(index + offset) % beautyPalette.length]
    )
}

function buildTopBeautyConfig(data){
    const sorted = [...data]
        .sort((a,b) =>
            chartToNumber(b.dss_score) - chartToNumber(a.dss_score) ||
            chartToNumber(b.rating) - chartToNumber(a.rating) ||
            chartToNumber(b.number_of_reviews) - chartToNumber(a.number_of_reviews)
        )
        .slice(0,20)

    return {
        type:'bar',
        data:{
            labels:sorted.map(item => item.product_name),
            datasets:[{
                label:'Beauty Match',
                data:sorted.map(item => Math.round(chartToNumber(item.dss_score) * 100)),
                backgroundColor:paletteFor(sorted.length),
                borderRadius:12,
                borderSkipped:false,
                barPercentage:0.58,
                categoryPercentage:0.72,
                barThickness:10,    
                maxBarThickness:12
            }]
        },
        options:createCommonOptions({
            indexAxis:'y',
            scales:{
                x:{
                    grid:{ color:'rgba(240,98,146,0.08)' },
                    ticks:{ color:'#7b6c74', callback:value => `${value}%` }
                },
                y:{
                    grid:{ display:false },
                    ticks:{ color:'#7b6c74' }
                }
            },
            plugins:{
                tooltip:{
                    callbacks:{
                        label(context){
                            const item = sorted[context.dataIndex]
                            return [
                                `Beauty Match: ${Math.round(chartToNumber(item.dss_score) * 100)}%`,
                                `Brand: ${item.brand}`,
                                `Rating: ${chartToNumber(item.rating).toFixed(1)}`,
                                `Price: ${chartFormatPrice(chartUsdToIdr(item.price_usd))}`,
                                `Skin type: ${item.skin_type}`
                            ]
                        }
                    }
                }
            }
        })
    }
}

function buildSkinMatchConfig(data){
    const skinOrder = ['oily','dry','sensitive','combination']
    const labels = {
        oily:'Oily Skin',
        dry:'Dry Skin',
        sensitive:'Sensitive Skin',
        combination:'Combination Skin'
    }

    const bestBySkin = skinOrder.map(skin => {
        const matches = data
            .filter(item => item.skin_type === skin)
            .sort((a,b) =>
                chartToNumber(b.dss_score) - chartToNumber(a.dss_score) ||
                chartToNumber(b.rating) - chartToNumber(a.rating)
            )

        const top = matches[0]
        return {
            label:labels[skin],
            score:top ? Math.round(chartToNumber(top.dss_score) * 100) : 0,
            product:top?.product_name || '-',
            brand:top?.brand || '-',
            rating:chartToNumber(top?.rating || 0)
        }
    })

    return {
        type:'bar',
        data:{
            labels:bestBySkin.map(item => item.label),
            datasets:[{
                label:'Best Skin Match',
                data:bestBySkin.map(item => item.score),
                backgroundColor:paletteFor(bestBySkin.length, 2),
                borderRadius:12,
                borderSkipped:false,
                barPercentage:0.6,
                categoryPercentage:0.72
            }]
        },
        options:createCommonOptions({
            indexAxis:'y',
            scales:{
                x:{
                    grid:{ color:'rgba(240,98,146,0.08)' },
                    ticks:{ color:'#7b6c74', callback:value => `${value}%` }
                },
                y:{
                    grid:{ display:false },
                    ticks:{ color:'#7b6c74' }
                }
            },
            plugins:{
                tooltip:{
                    callbacks:{
                        label(context){
                            const item = bestBySkin[context.dataIndex]
                            return [
                                `Beauty Match: ${item.score}%`,
                                `Top pick: ${item.product}`,
                                `Brand: ${item.brand}`,
                                `Rating: ${item.rating.toFixed(1)}`
                            ]
                        }
                    }
                }
            }
        })
    }
}

function buildBrandConfig(data){
    const brandMap = {}
    data.forEach(item => {
        const brand = item.brand || 'Unknown'
        if(!brandMap[brand]){
            brandMap[brand] = { brand, count:0, ratingTotal:0, dssTotal:0 }
        }
        brandMap[brand].count += 1
        brandMap[brand].ratingTotal += chartToNumber(item.rating)
        brandMap[brand].dssTotal += chartToNumber(item.dss_score)
    })

    const ranked = Object.values(brandMap)
        .map(item => {
            const avgRating = item.ratingTotal / item.count
            const avgMatch = item.dssTotal / item.count
            const popularity = avgRating * 20 + avgMatch * 50 + Math.log10(item.count + 1) * 10
            return {
                brand:item.brand,
                avgRating:Number(avgRating.toFixed(1)),
                avgMatch:Number((avgMatch * 100).toFixed(1)),
                popularity:Number(popularity.toFixed(1)),
                count:item.count
            }
        })
        .sort((a,b) => b.popularity - a.popularity)
        .slice(0,10)

    return {
        type:'bar',
        data:{
            labels:ranked.map(item => item.brand),
            datasets:[{
                label:'Popularity Score',
                data:ranked.map(item => item.popularity),
                backgroundColor:paletteFor(ranked.length, 1),
                borderRadius:12,
                borderSkipped:false,
                barPercentage:0.6,
                categoryPercentage:0.72
            }]
        },
        options:createCommonOptions({
            indexAxis:'y',
            plugins:{
                tooltip:{
                    callbacks:{
                        label(context){
                            const item = ranked[context.dataIndex]
                            return [
                                `Popularity score: ${item.popularity}`,
                                `Avg rating: ${item.avgRating}`,
                                `Beauty match: ${item.avgMatch}%`,
                                `Products in data: ${item.count}`
                            ]
                        }
                    }
                }
            }
        })
    }
}

function buildValueConfig(data){
    const minPrice = Math.min(...data.map(item => chartUsdToIdr(item.price_usd)))
    const maxPrice = Math.max(...data.map(item => chartUsdToIdr(item.price_usd)))

    const ranked = [...data]
        .map(item => {
            const price = chartUsdToIdr(item.price_usd)
            const rating = chartToNumber(item.rating)
            const dss = chartToNumber(item.dss_score)
            const priceEfficiency = 1 - ((price - minPrice) / (maxPrice - minPrice || 1))
            const valueScore = dss * 45 + (rating / 5) * 35 + priceEfficiency * 20
            return {
                product_name:item.product_name,
                rating,
                price,
                skin_type:item.skin_type,
                valueScore:Number(valueScore.toFixed(1))
            }
        })
        .sort((a,b) => b.valueScore - a.valueScore)
        .slice(0,10)

    return {
        type:'bar',
        data:{
            labels:ranked.map(item => item.product_name),
            datasets:[{
                label:'Value for Money',
                data:ranked.map(item => item.valueScore),
                backgroundColor:paletteFor(ranked.length, 3),
                borderRadius:12,
                borderSkipped:false,
                barPercentage:0.6,
                categoryPercentage:0.72,
                barThickness:14,
                maxBarThickness:18
            }]
        },
        options:createCommonOptions({
            indexAxis:'y',
            scales:{
                x:{ grid:{ color:'rgba(240,98,146,0.08)' }, ticks:{ color:'#7b6c74' } },
                y:{ grid:{ display:false }, ticks:{ color:'#7b6c74' } }
            },
            plugins:{
                tooltip:{
                    callbacks:{
                        label(context){
                            const item = ranked[context.dataIndex]
                            return [
                                `Value score: ${item.valueScore}`,
                                `Price: ${chartFormatPrice(item.price)}`,
                                `Rating: ${item.rating.toFixed(1)}`,
                                `Skin type: ${item.skin_type}`
                            ]
                        }
                    }
                }
            }
        })
    }
}

function buildTrendingConfig(data){
    const ranked = [...data]
        .map(item => {
            const reviews = chartToNumber(item.number_of_reviews)
            const dss = chartToNumber(item.dss_score)
            const trendScore = Math.log10(reviews + 1) * 65 + dss * 35
            return {
                product_name:item.product_name,
                brand:item.brand,
                reviews,
                rating:chartToNumber(item.rating),
                trendScore:Number(trendScore.toFixed(1))
            }
        })
        .sort((a,b) => b.trendScore - a.trendScore)
        .slice(0,10)

    return {
        type:'bar',
        data:{
            labels:ranked.map(item => item.product_name),
            datasets:[{
                label:'Trending Score',
                data:ranked.map(item => item.trendScore),
                backgroundColor:paletteFor(ranked.length, 0),
                borderRadius:12,
                borderSkipped:false,
                barPercentage:0.6,
                categoryPercentage:0.72
            }]
        },
        options:createCommonOptions({
            indexAxis:'y',
            plugins:{
                tooltip:{
                    callbacks:{
                        label(context){
                            const item = ranked[context.dataIndex]
                            return [
                                `Trending score: ${item.trendScore}`,
                                `Reviews: ${item.reviews}`,
                                `Rating: ${item.rating.toFixed(1)}`,
                                `Brand: ${item.brand}`
                            ]
                        }
                    }
                }
            }
        })
    }
}

function buildIngredientConfig(data){
    const ingredientMap = {}
    data.forEach(item => {
        const ingredient = item.main_ingredient || 'Unknown'
        ingredientMap[ingredient] = (ingredientMap[ingredient] || 0) + 1
    })

    const ranked = Object.entries(ingredientMap)
        .map(([ingredient,count]) => ({ ingredient, count }))
        .sort((a,b) => b.count - a.count)
        .slice(0,6)

    return {
        type:'doughnut',
        data:{
            labels:ranked.map(item => item.ingredient),
            datasets:[{
                data:ranked.map(item => item.count),
                backgroundColor:paletteFor(ranked.length, 2),
                borderWidth:0
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            cutout:'70%',
            radius:'86%',
            plugins:{
                legend:{
                    position:'bottom',
                    labels:{ usePointStyle:true, color:'#7b6c74' }
                },
                tooltip:{
                    backgroundColor:'rgba(255,255,255,0.97)',
                    titleColor:'#2B2B2B',
                    bodyColor:'#555',
                    borderColor:'rgba(240,98,146,0.16)',
                    borderWidth:1,
                    padding:12,
                    cornerRadius:14
                }
            }
        }
    }
}

function buildPriceQualityConfig(data){
    const minPrice = Math.min(...data.map(item => chartUsdToIdr(item.price_usd)))
    const maxPrice = Math.max(...data.map(item => chartUsdToIdr(item.price_usd)))

    const points = data.map(item => {
        const price = chartUsdToIdr(item.price_usd)
        const rating = chartToNumber(item.rating)
        const dss = chartToNumber(item.dss_score)
        return {
            x:price,
            y:rating,
            product_name:item.product_name,
            brand:item.brand,
            price,
            rating,
            match:Math.round(dss * 100),
            backgroundColor:beautyPalette[Math.floor(dss * 10) % beautyPalette.length]
        }
    })

    return {
        type:'scatter',
        data:{
            datasets:[{
                label:'Price vs Rating',
                data:points,
                backgroundColor:points.map(item => item.backgroundColor),
                pointRadius:5,
                pointHoverRadius:10,
                pointBorderColor:'#ffffff',
                pointBorderWidth:2
            }]
        },
        options:createCommonOptions({
            scales:{
                x:{
                    grid:{ color:'rgba(240,98,146,0.08)' },
                    ticks:{ color:'#7b6c74', callback:value => chartFormatPrice(value) }
                },
                y:{ grid:{ color:'rgba(240,98,146,0.08)' }, ticks:{ color:'#7b6c74' } }
            },
            plugins:{
                tooltip:{
                    callbacks:{
                        label(context){
                            const item = context.raw
                            return [
                                `${item.product_name}`,
                                `Brand: ${item.brand}`,
                                `Price: ${chartFormatPrice(item.price)}`,
                                `Rating: ${item.rating.toFixed(1)}`,
                                `Beauty match: ${item.match}%`
                            ]
                        }
                    }
                }
            },
            elements:{ point:{ radius:4 } }
        })
    }
}

function buildSatisfactionConfig(data){
    const ranked = [...data]
        .sort((a,b) =>
            chartToNumber(b.rating) - chartToNumber(a.rating) ||
            chartToNumber(b.number_of_reviews) - chartToNumber(a.number_of_reviews)
        )
        .slice(0,10)
        .map(item => ({
            product_name:item.product_name,
            brand:item.brand,
            rating:chartToNumber(item.rating),
            reviews:chartToNumber(item.number_of_reviews),
            match:Math.round(chartToNumber(item.dss_score) * 100)
        }))

    return {
        type:'bar',
        data:{
            labels:ranked.map(item => item.product_name),
            datasets:[{
                label:'User Satisfaction',
                data:ranked.map(item => item.rating),
                backgroundColor:paletteFor(ranked.length, 4),
                borderRadius:12,
                borderSkipped:false,
                barPercentage:0.6,
                categoryPercentage:0.72,
                barThickness:14,
                maxBarThickness:18
            }]
        },
        options:createCommonOptions({
            indexAxis:'y',
            scales:{
                x:{ grid:{ color:'rgba(240,98,146,0.08)' }, ticks:{ color:'#7b6c74' } },
                y:{ grid:{ display:false }, ticks:{ color:'#7b6c74' } }
            },
            plugins:{
                tooltip:{
                    callbacks:{
                        label(context){
                            const item = ranked[context.dataIndex]
                            return [
                                `Rating: ${item.rating.toFixed(1)}`,
                                `Reviews: ${item.reviews}`,
                                `Beauty match: ${item.match}%`,
                                `Brand: ${item.brand}`
                            ]
                        }
                    }
                }
            }
        })
    }
}
