const SKIN_TABS = [
    { key:'oily', label:'Oily Skin' },
    { key:'dry', label:'Dry Skin' },
    { key:'sensitive', label:'Sensitive Skin' },
    { key:'combination', label:'Combination Skin' }
]

function toNumber(value){
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

const DASHBOARD_USD_TO_IDR = 16000

function usdToIdr(value){
    return toNumber(value) * DASHBOARD_USD_TO_IDR
}

function formatPrice(value){
    return new Intl.NumberFormat('id-ID', {
        style:'currency',
        currency:'IDR',
        maximumFractionDigits:0
    }).format(toNumber(value))
}

function formatPercent(value){
    return `${Math.round(toNumber(value) * 100)}%`
}

function formatCompactNumber(value){
    return new Intl.NumberFormat('id-ID', {
        notation:'compact',
        maximumFractionDigits:1
    }).format(toNumber(value))
}

function toTitleCase(text){
    return String(text || '')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase())
}

function normalizePrice(price, minPrice, maxPrice){
    if(!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || minPrice === maxPrice){
        return 1
    }

    const normalized = (price - minPrice) / (maxPrice - minPrice)
    return 1 - Math.max(0, Math.min(1, normalized))
}

const dashboardApp = Vue.createApp({

    data(){

        return{

            products:[],

            totalProducts:0,

            totalCategory:0,

            topBrand:'-',

            avgRating:'0.0',

            avgDSS:0,

            activeDashboardTab:'decision',

            chartTabs:[
                { key:'decision', label:'For You' },
                { key:'discover', label:'Beauty Discovery' },
                { key:'compare', label:'Compare' }
            ],

            activeSkinType:'combination',

            skinTabs:SKIN_TABS,

            skinRecommendations:{},

            topBeautyPicks:[],

            bestValueProducts:[],

            trendingProducts:[],

            satisfactionHighlights:[],

            mostLovedBrands:[],

            ingredientHighlights:[],

            compareInsights:[]

        }

    },

    computed:{

        activeSkinRecommendations(){

            return this.skinRecommendations[this.activeSkinType] || []

        },

        activeSkinLabel(){

            return (
                this.skinTabs.find(
                    tab => tab.key === this.activeSkinType
                )?.label || 'Skin Type'
            )

        }

        ,

        formattedTotalProducts(){
            return formatCompactNumber(this.totalProducts)
        },

        formattedTotalCategory(){
            return toNumber(this.totalCategory)
        },

        topBrandTitle(){
            if(!this.topBrand || this.topBrand === '-'){
                return 'Most Loved Brand'
            }
            return `${toTitleCase(this.topBrand)} Most Loved`
        }

    },

    methods:{

        formatPrice,

        formatPercent,

        switchDashboardTab(tab){

            this.activeDashboardTab = tab

        },

        renderChartsForTab(tab, { force = false } = {}){

            if(!Array.isArray(this.products) || !this.products.length){
                return
            }

            const renderersByTab = {
                decision:[
                    () => renderTopBeautyChart(this.products),
                    () => renderSkinMatchChart(this.products),
                    () => renderValueChart(this.products),
                    () => renderSatisfactionChart(this.products)
                ],
                discover:[
                    () => renderBrandChart(this.products),
                    () => renderTrendingChart(this.products),
                    () => renderIngredientChart(this.products)
                ],
                compare:[
                    () => renderPriceQualityChart(this.products)
                ]
            }

            const runners = renderersByTab[tab] || []
            runners.forEach(fn => fn())

            if(force && tab !== this.activeDashboardTab){
                this.activeDashboardTab = tab
            }

        },

        refreshActiveTabCharts(){

            this.renderChartsForTab(this.activeDashboardTab, { force:true })

        },

        calculateAnalytics(){

            this.totalProducts =
            this.products.length

            const categories =
            [...new Set(
                this.products.map(
                    item => item.category
                )
            )]

            this.totalCategory =
            categories.length

            const brandCount = {}

            this.products.forEach(item => {

                const brand = item.brand || '-'

                brandCount[brand] =
                (brandCount[brand] || 0) + 1

            })

            const brandKeys = Object.keys(brandCount)

            this.topBrand = brandKeys.length
                ? brandKeys.reduce(

                    (a,b)=>
                    brandCount[a] > brandCount[b] ? a : b

                )
                : '-'

            const totalRating =
            this.products.reduce(
                (sum,item) =>
                    sum + toNumber(item.rating),
                0
            )

            this.avgRating = this.products.length
                ? (totalRating / this.products.length).toFixed(1)
                : '0.0'

            const totalDSS =
            this.products.reduce(
                (sum,item) =>
                    sum + toNumber(item.dss_score),
                0
            )

            this.avgDSS = this.products.length
                ? Math.round((totalDSS / this.products.length) * 100)
                : 0

        },

        buildBeautyInsights(){

            const normalizedProducts =
            this.products.map(item => ({
                ...item,
                price:usdToIdr(item.price_usd),
                ratingValue:toNumber(item.rating),
                reviewCount:toNumber(item.number_of_reviews),
                dssValue:toNumber(item.dss_score),
                beautyMatch:Math.round(toNumber(item.dss_score) * 100)
            }))

            if(!normalizedProducts.length){
                return
            }

            const minPrice =
            Math.min(...normalizedProducts.map(item => item.price))

            const maxPrice =
            Math.max(...normalizedProducts.map(item => item.price))

            this.topBeautyPicks =
            [...normalizedProducts]
                .sort((a,b) =>
                    b.dssValue - a.dssValue ||
                    b.ratingValue - a.ratingValue ||
                    b.reviewCount - a.reviewCount
                )
                .slice(0,20)
                .map((item,index) => ({
                    ...item,
                    rank:index + 1
                }))

            this.bestValueProducts =
            [...normalizedProducts]
                .map(item => ({
                    ...item,
                    valueScore:
                        item.dssValue * 0.45 +
                        (item.ratingValue / 5) * 0.3 +
                        normalizePrice(item.price, minPrice, maxPrice) * 0.25
                }))
                .sort((a,b) =>
                    b.valueScore - a.valueScore ||
                    b.ratingValue - a.ratingValue
                )
                .slice(0,10)

            this.trendingProducts =
            [...normalizedProducts]
                .map(item => ({
                    ...item,
                    trendScore:
                        Math.log10(item.reviewCount + 1) * 0.7 +
                        item.dssValue * 0.3
                }))
                .sort((a,b) =>
                    b.trendScore - a.trendScore ||
                    b.reviewCount - a.reviewCount
                )
                .slice(0,10)

            this.satisfactionHighlights =
            [...normalizedProducts]
                .sort((a,b) =>
                    b.ratingValue - a.ratingValue ||
                    b.reviewCount - a.reviewCount
                )
                .slice(0,10)

            const brandMap = {}

            normalizedProducts.forEach(item => {

                const brand = item.brand || 'Unknown'

                if(!brandMap[brand]){

                    brandMap[brand] = {
                        brand,
                        count:0,
                        ratingTotal:0,
                        dssTotal:0,
                        reviewTotal:0
                    }

                }

                brandMap[brand].count += 1
                brandMap[brand].ratingTotal += item.ratingValue
                brandMap[brand].dssTotal += item.dssValue
                brandMap[brand].reviewTotal += item.reviewCount

            })

            this.mostLovedBrands =
            Object.values(brandMap)
                .map(item => {

                    const avgRating = item.ratingTotal / item.count
                    const avgDss = item.dssTotal / item.count
                    const popularityScore =
                        avgRating * 0.45 +
                        avgDss * 5 * 0.35 +
                        Math.log10(item.count + 1) * 0.2

                    return {
                        brand:item.brand,
                        count:item.count,
                        avgRating:Number(avgRating.toFixed(1)),
                        avgDss:Number(avgDss.toFixed(3)),
                        popularityScore:Number(popularityScore.toFixed(2))
                    }

                })
                .sort((a,b) =>
                    b.popularityScore - a.popularityScore ||
                    b.count - a.count
                )
                .slice(0,10)

            const ingredientMap = {}

            normalizedProducts.forEach(item => {

                const ingredient = item.main_ingredient || 'Unknown'

                ingredientMap[ingredient] =
                (ingredientMap[ingredient] || 0) + 1

            })

            this.ingredientHighlights =
            Object.keys(ingredientMap)
                .map(ingredient => ({
                    ingredient,
                    count:ingredientMap[ingredient]
                }))
                .sort((a,b) => b.count - a.count)
                .slice(0,6)

            this.skinRecommendations =
            this.skinTabs.reduce((acc, skinTab) => {

                acc[skinTab.key] =
                normalizedProducts
                    .filter(item => item.skin_type === skinTab.key)
                    .sort((a,b) =>
                        b.dssValue - a.dssValue ||
                        b.ratingValue - a.ratingValue
                    )
                    .slice(0,3)

                return acc

            }, {})

            this.compareInsights =
            [...this.bestValueProducts]
                .slice(0,4)
                .map(item => ({
                    product_name:item.product_name,
                    brand:item.brand,
                    price:formatPrice(item.price),
                    rating:item.rating.toFixed(1),
                    score:item.beautyMatch
                }))

        }

    },

    watch:{

        activeDashboardTab(){
            this.$nextTick(() => {
                this.refreshActiveTabCharts()
            })
        }

    },

    mounted(){

        loadCSV((data) => {

            this.products = data

            this.calculateAnalytics()

            this.buildBeautyInsights()

            this.$nextTick(() => {
                this.refreshActiveTabCharts()
            })

        })

    },

    beforeUnmount(){
        if(typeof destroyAllCharts === 'function'){
            destroyAllCharts()
        }
    }

})

dashboardApp.mount('#dashboardApp')
