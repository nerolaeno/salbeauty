function loadCSV(callback){

    Papa.parse("data/kosmetik_clean.csv",{

        download:true,

        header:true,

        skipEmptyLines:true,

        dynamicTyping:true,

        complete:function(results){

            let data = results.data

            // =========================================
            // CLEAN DATA
            // =========================================

            data = data.filter(item =>

                item.product_name &&
                item.brand &&
                item.category &&
                item.rating &&
                item.price_usd

            )

            // =========================================
            // AUTO DSS SCORE
            // jika dss_score belum ada
            // =========================================

            data.forEach(item => {

                if(
                    item.dss_score === undefined ||
                    item.dss_score === null ||
                    item.dss_score === ""
                ){

                    const rating =
                    Number(item.rating) || 0

                    const reviews =
                    Number(item.number_of_reviews) || 0

                    const price =
                    Number(item.price_usd) || 0

                    // =================================
                    // NORMALISASI
                    // =================================

                    const ratingScore =
                    rating / 5

                    const reviewScore =
                    Math.min(reviews / 1000, 1)

                    const priceScore =
                    1 - Math.min(price / 500, 1)

                    // =================================
                    // DSS WEIGHT
                    // Rating = 50%
                    // Price = 30%
                    // Review = 20%
                    // =================================

                    item.dss_score = (

                        (ratingScore * 0.5) +
                        (priceScore * 0.3) +
                        (reviewScore * 0.2)

                    )

                }

            })

            callback(data)

        }

    })

}