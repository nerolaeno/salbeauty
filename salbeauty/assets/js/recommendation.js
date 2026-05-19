const recommendationApp = Vue.createApp({
    data(){
        return{
            products:[],
            searchQuery:'',
            draftCategory:'',
            draftBrand:'',
            draftSkinType:'',
            draftRating:'',
            draftSortOption:'most_recommended',
            selectedCategory:'',
            selectedBrand:'',
            selectedSkinType:'',
            selectedRating:'',
            sortOption:'most_recommended',
            currentPage:1,
            pageSize:10
        }
    },

    computed:{
        categories(){
            return [...new Set(this.products.map(item => item.category).filter(Boolean))]
        },

        brands(){
            return [...new Set(this.products.map(item => item.brand).filter(Boolean))]
        },

        skinTypes(){
            return [...new Set(this.products.map(item => item.skin_type).filter(Boolean))]
        },

        baseFilteredProducts(){
            let filtered = [...this.products]

            if(this.searchQuery){
                const q = this.searchQuery.toLowerCase()
                filtered = filtered.filter(item => (item.product_name || '').toLowerCase().includes(q))
            }

            if(this.selectedCategory){
                filtered = filtered.filter(item => item.category === this.selectedCategory)
            }

            if(this.selectedBrand){
                filtered = filtered.filter(item => item.brand === this.selectedBrand)
            }

            if(this.selectedSkinType){
                filtered = filtered.filter(item => item.skin_type === this.selectedSkinType)
            }

            if(this.selectedRating){
                filtered = filtered.filter(item => Number(item.rating) >= Number(this.selectedRating))
            }

            return filtered
        },

        sortedProducts(){
            const sorted = [...this.baseFilteredProducts]

            if(this.sortOption === 'most_recommended'){
                sorted.sort((a,b)=> Number(b.dss_score) - Number(a.dss_score))
            } else if(this.sortOption === 'top_rated'){
                sorted.sort((a,b)=> Number(b.rating) - Number(a.rating))
            } else {
                sorted.sort((a,b)=> this.getMatchPercent(b) - this.getMatchPercent(a))
            }

            return sorted
        },

        totalPages(){
            return Math.max(1, Math.ceil(this.sortedProducts.length / this.pageSize))
        },

        paginatedProducts(){
            const start = (this.currentPage - 1) * this.pageSize
            return this.sortedProducts.slice(start, start + this.pageSize)
        },

        visiblePages(){
            const total = this.totalPages
            const current = this.currentPage
            const pages = []
            const windowSize = 5

            if(total <= windowSize){
                for(let p = 1; p <= total; p += 1){
                    pages.push(p)
                }
                return pages
            }

            let start = current - Math.floor(windowSize / 2)
            let end = current + Math.floor(windowSize / 2)

            if(start < 1){
                start = 1
                end = windowSize
            }

            if(end > total){
                end = total
                start = total - windowSize + 1
            }

            for(let p = start; p <= end; p += 1){
                pages.push(p)
            }

            return pages
        }
    },

    methods:{
        usdToIdr(usd){
            return Number(usd) * 16000
        },
        setPage(page){
            if(page < 1 || page > this.totalPages){
                return
            }
            this.currentPage = page
        },

        rankNumber(index){
            return ((this.currentPage - 1) * this.pageSize) + index + 1
        },

        formatPrice(price){
            const value = this.usdToIdr(price)
            if(Number.isNaN(value)){
                return 'Rp0'
            }
            return new Intl.NumberFormat('id-ID', {
                style:'currency',
                currency:'IDR',
                maximumFractionDigits:0
            }).format(value)
        },

        formatRating(rating){
            const value = Number(rating)
            if(Number.isNaN(value)){
                return '0.0'
            }
            return value.toFixed(1)
        },

        getMatchPercent(product){
            const score = Number(product.dss_score)
            if(Number.isNaN(score)){
                return 80
            }
            const normalized = Math.max(0.75, Math.min(0.99, score))
            return Math.round(normalized * 100)
        },

        getBadgeLabel(product){
            const rating = Number(product.rating)
            const score = Number(product.dss_score)
            const match = this.getMatchPercent(product)

            if(match >= 95 || score >= 0.9){
                return '✨ Best Match'
            }
            if(rating >= 4.7){
                return '⭐ Top Rated'
            }
            if(score >= 0.82){
                return '💖 Most Loved'
            }
            return '🔥 Trending'
        },

        badgeClass(product){
            const label = this.getBadgeLabel(product)
            if(label.includes('Best Match')) return 'badge-best'
            if(label.includes('Top Rated')) return 'badge-top'
            if(label.includes('Most Loved')) return 'badge-loved'
            return 'badge-trending'
        },

        getShortDescription(product){
            const skin = product.skin_type || 'all skin'
            const category = product.category || 'beauty'
            return `${category} formula yang cocok untuk ${skin}.`
        },

        resetFilters(){
            this.searchQuery = ''
            this.draftCategory = ''
            this.draftBrand = ''
            this.draftSkinType = ''
            this.draftRating = ''
            this.draftSortOption = 'most_recommended'
            this.selectedCategory = ''
            this.selectedBrand = ''
            this.selectedSkinType = ''
            this.selectedRating = ''
            this.sortOption = 'most_recommended'
            this.currentPage = 1
        },

        applyFilters(){
            this.selectedCategory = this.draftCategory
            this.selectedBrand = this.draftBrand
            this.selectedSkinType = this.draftSkinType
            this.selectedRating = this.draftRating
            this.sortOption = this.draftSortOption
            this.currentPage = 1
        }
    },

    watch:{
        searchQuery(){ this.currentPage = 1 },
        selectedCategory(){ this.currentPage = 1 },
        selectedBrand(){ this.currentPage = 1 },
        selectedSkinType(){ this.currentPage = 1 },
        selectedRating(){ this.currentPage = 1 },
        sortOption(){ this.currentPage = 1 }
    },

    mounted(){
        loadCSV((data)=>{
            this.products = data
        })
    }
})

recommendationApp.mount('#recommendationApp')
