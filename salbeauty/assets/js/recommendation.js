const recommendationApp = Vue.createApp({

    data(){

        return{

            products:[],

            searchQuery:'',

            selectedCategory:'',

            selectedBrand:'',

            sortOption:'high'

        }

    },

    computed:{

        // =====================================
        // CATEGORY LIST
        // =====================================

        categories(){

            return [

                ...new Set(

                    this.products.map(
                        item => item.category
                    )

                )

            ]

        },

        // =====================================
        // BRAND LIST
        // =====================================

        brands(){

            return [

                ...new Set(

                    this.products.map(
                        item => item.brand
                    )

                )

            ]

        },

        // =====================================
        // FILTER PRODUCT
        // =====================================

        filteredProducts(){

            let filtered = [...this.products]

            // SEARCH
            if(this.searchQuery){

                filtered = filtered.filter(item =>

                    item.product_name
                    .toLowerCase()

                    .includes(

                        this.searchQuery
                        .toLowerCase()

                    )

                )

            }

            // CATEGORY
            if(this.selectedCategory){

                filtered = filtered.filter(item =>

                    item.category ===
                    this.selectedCategory

                )

            }

            // BRAND
            if(this.selectedBrand){

                filtered = filtered.filter(item =>

                    item.brand ===
                    this.selectedBrand

                )

            }

            // SORTING
            if(this.sortOption === 'high'){

                filtered.sort(

                    (a,b)=>

                    Number(b.dss_score) -
                    Number(a.dss_score)

                )

            }

            else if(this.sortOption === 'low'){

                filtered.sort(

                    (a,b)=>

                    Number(a.dss_score) -
                    Number(b.dss_score)

                )

            }

            else if(this.sortOption === 'rating'){

                filtered.sort(

                    (a,b)=>

                    Number(b.rating) -
                    Number(a.rating)

                )

            }

            return filtered

        }

    },

    mounted(){

        loadCSV((data)=>{

            this.products = data

        })

    }

})

recommendationApp.mount('#recommendationApp')