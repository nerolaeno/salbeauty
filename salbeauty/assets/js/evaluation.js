const evaluationApp = Vue.createApp({

    data(){

        return{

            products:[],

            avgDSS:0,
            avgMatchLabel:'-',

            topCategory:'-',

            topBrand:'-',

            topSkin:'-',

            topProducts:[]

        }

    },

    methods:{

        formatRupiah(usd){
            const idr = Number(usd || 0) * 16000
            return new Intl.NumberFormat('id-ID', {
                style:'currency',
                currency:'IDR',
                maximumFractionDigits:0
            }).format(idr)
        },

        formatRating(value){
            return Number(value || 0).toFixed(1)
        },

        calculateInsight(){
            const totalDSS =
                this.products.reduce((sum,item)=> sum + Number(item.dss_score || 0), 0)

            const avgScore = totalDSS / this.products.length

            this.avgDSS = (avgScore * 100).toFixed(1)

            if(avgScore >= 0.85){
                this.avgMatchLabel = 'Sangat Cocok'
            } else if(avgScore >= 0.7){
                this.avgMatchLabel = 'Cocok'
            } else if(avgScore >= 0.55){
                this.avgMatchLabel = 'Cukup Cocok'
            } else {
                this.avgMatchLabel = 'Perlu Penyesuaian'
            }

            const categoryMap = {}
            this.products.forEach(item => {
                const category = item.category || 'Unknown'
                categoryMap[category] = (categoryMap[category] || 0) + 1
            })

            this.topCategory = Object.keys(categoryMap).reduce((a,b)=> categoryMap[a] > categoryMap[b] ? a : b)

            const brandMap = {}
            this.products.forEach(item => {
                const brand = item.brand || 'Unknown'
                brandMap[brand] = (brandMap[brand] || 0) + 1
            })

            this.topBrand = Object.keys(brandMap).reduce((a,b)=> brandMap[a] > brandMap[b] ? a : b)

            const skinMap = {}
            this.products.forEach(item => {
                const skin = item.skin_type || 'Unknown'
                skinMap[skin] = (skinMap[skin] || 0) + 1
            })

            this.topSkin = Object.keys(skinMap).reduce((a,b)=> skinMap[a] > skinMap[b] ? a : b)

            this.topProducts =
                [...this.products]
                .sort((a,b)=> Number(b.dss_score) - Number(a.dss_score))
                .slice(0,6)

        }

    },

    mounted(){

        loadCSV((data)=>{

            this.products = data

            this.calculateInsight()

        })

    }

})

evaluationApp.mount('#evaluationApp')
