const app = Vue.createApp({

    data(){

        return{

            products:[],

            totalProducts:0,

            totalBrand:0,

            totalCategory:0,

            avgRating:0,

            avgDSS:0,

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

        calculateAnalytics(){

            this.totalProducts =
            this.products.length

            const brands =
            [...new Set(
                this.products.map(
                    item => item.brand
                )
            )]

            this.totalBrand =
            brands.length

            const categories =
            [...new Set(
                this.products.map(
                    item => item.category
                )
            )]

            this.totalCategory =
            categories.length

            const ratingTotal =
            this.products.reduce(
                (sum,item)=> sum + Number(item.rating || 0),
                0
            )

            this.avgRating =
                (
                    ratingTotal /
                    this.products.length
                ).toFixed(1)

            const dssTotal =
            this.products.reduce(
                (sum,item)=> sum + Number(item.dss_score || 0),
                0
            )

            this.avgDSS =
                (
                    dssTotal /
                    this.products.length
                ).toFixed(3)

            this.topProducts =
                [...this.products]
                .sort((a,b)=> Number(b.dss_score) - Number(a.dss_score))
                .slice(0,6)

        }

    },

    mounted(){

        loadCSV((data)=>{

            this.products = data

            this.calculateAnalytics()

        })

    }

})

app.mount('#app')
