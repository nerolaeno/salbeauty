const evaluationApp = Vue.createApp({

    data(){

        return{

            products:[],

            avgDSS:0,

            topCategory:'-',

            topBrand:'-',

            topSkin:'-',

            topProducts:[]

        }

    },

    methods:{

        calculateInsight(){

            // =====================================
            // AVG DSS
            // =====================================

            const totalDSS =

                this.products.reduce(

                    (sum,item)=>

                    sum + Number(item.dss_score || 0),

                    0

                )

            this.avgDSS =

                (
                    totalDSS /
                    this.products.length
                ).toFixed(3)

            // =====================================
            // TOP CATEGORY
            // =====================================

            const categoryMap = {}

            this.products.forEach(item => {

                const category =
                item.category || 'Unknown'

                categoryMap[category] =
                (categoryMap[category] || 0) + 1

            })

            this.topCategory =

                Object.keys(categoryMap)

                .reduce(

                    (a,b)=>

                    categoryMap[a] >
                    categoryMap[b]

                    ? a : b

                )

            // =====================================
            // TOP BRAND
            // =====================================

            const brandMap = {}

            this.products.forEach(item => {

                const brand =
                item.brand || 'Unknown'

                brandMap[brand] =
                (brandMap[brand] || 0) + 1

            })

            this.topBrand =

                Object.keys(brandMap)

                .reduce(

                    (a,b)=>

                    brandMap[a] >
                    brandMap[b]

                    ? a : b

                )

            // =====================================
            // TOP SKIN TYPE
            // =====================================

            const skinMap = {}

            this.products.forEach(item => {

                const skin =
                item.skin_type || 'Unknown'

                skinMap[skin] =
                (skinMap[skin] || 0) + 1

            })

            this.topSkin =

                Object.keys(skinMap)

                .reduce(

                    (a,b)=>

                    skinMap[a] >
                    skinMap[b]

                    ? a : b

                )

            // =====================================
            // TOP DSS PRODUCT
            // =====================================

            this.topProducts =

                [...this.products]

                .sort(

                    (a,b)=>

                    Number(b.dss_score) -
                    Number(a.dss_score)

                )

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