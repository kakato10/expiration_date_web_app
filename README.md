expiration_date_web_app
=======================

Web app for products expiration dates for a small shop
This app should make easier the managment of shops, which products have expiration dates.
The colors refer as follows:
- red : product, which expiration date has passed with no more than a week
- orange : prdocut, which expiration date is going to pass during the next 7 days
- yellow : product, with expiration date that is going to pass in less than 30 days but more than 7
- white : product, with expiration date that is goin to pass in more than a month
- If the expiration date of a product has passed with more than a week it's automatically deleted in order to optimise the memory usage 

The program uses the localStoraga of your browser therefor it doesn't have big capacity and will be most usefull to small shops.

Yet to be done:
Automatically order the table via dates.