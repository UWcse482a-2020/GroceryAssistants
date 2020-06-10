# eGroceryAssistant 

## Project Development

Overall, our project aims to make shopping for WIC-eligible food products easier during public emergencies by providing product availability estimates using crowdsourced data. Our web application recommends/ranks WIC vendors to the users based on their location and the estimated amount of the product of interest in store, calculated from user feedback. In the following section, we first give an overview of the project structure, then elaborate on each part of the project development and how to configure them for reproducibility. 

### Overall Project Structure 

The following flow chart gives an overview of the project infrasture and the functional flow of the application:

![App Flowchart](./figures/flowchart.png)

The project file directory is structured as follows (`[Description]` denotes the purpose of the file/folder): 

```
├── 404.html
├── Data_Exploration [Data preparation & preprocessing]
│   ├── create_quantity_csv.ipynb
│   ├── edit_database.ipynb
│   └── try_loading_csv.ipynb
├── GroceryAssistants.iml [Firebase configuration] 
├── Readme.md
├── Scraping [Data preparation & preprocessing]
│   └── wic_stores.ipynb
├── assets [Website assets, css, styles, etc.] 
│   ├── css
│   ├── img
│   ├── js
│   └── vendor
├── build_public.sh [Shell command for deployment] 
├── data [Database files]
│   ├── quantities.csv
│   ├── quantities.json
│   ├── stores.csv
│   ├── wic_database.csv
│   └── wic_database_cleaned.csv
├── figures [Markdown figures]
│   └── flowchart.png
├── firebase.json [Firebase configuration]
├── index.html [Webpage]
├── public [Firebase deployed version]
│   ├── 404.html
│   ├── assets
│   ├── forms
│   ├── index.html
│   └── scripts
├── scripts [Javascript backend]
│   └── main.js
```

The main libraries & services we used include:
* [Pandas](https://pandas.pydata.org/) for easy tabular data exploration in Python
* [BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) for scraping information from websites in Python
* [Firebase](https://firebase.google.com/) as the backend for reading/writing JSON entries and deployment
* [HERE Maps](https://www.here.com/) for calculating driving locations 

### Data Preprocessing & Uploading

Before uploading the database to Firebase, we first preprocessed the acquired data file for better organizations to suit our application. In addition, we used web scraping techniques in Python to acquire a list of WIC food vendors from the [King County website](https://www.kingcounty.gov/depts/health/child-teen-health/women-infants-children.aspx#locations). Because Firebase free-tier plan only allows **one** database to be uploaded, the last step is to combine the food product database with the store & quantity database into one. This inevitably increases the size of the database and leads to slow performance in searching. 

Steps in detail (`[file/folder name]` denotes the file/folder that implements the function decribed):

1. Data cleaning (`Data_Exploration/edit_database.ipynb`): We cleaned and preprocessed some data to make the category information more readable and easy to search (For example, we grouped all “Infant” related product categories such as “Infant - Meats” and “Infant - Vegetable” to the large “Infant” category, with “Meats” and “Vegetable” being the subcategories
2. Web scraping (`Data_Exploration/create_quantity_csv.ipynb`): We scraped the list of King County WIC vendor (grocery stores) from the website above and randomly initialized the quantity of each product as a starting value. 
3. Database joining (`Data_Exploration/create_quantity_csv.ipynb`): We joined the food product information database and the store & quantity database into one. The output database is `data/quantities.csv` and `data/quantities.json`, which is the required format for Firebase.

The final database structure is shown as follows (in table format for readability, uploaded as JSON entries):
 UPC_PLU     | Category           | Subcategory              | Description                                          | Size | Unit | Store                    | Location                                                                  | Latitude   | Longitude  | Quantity | Last_Updated 
-------------|--------------------|--------------------------|------------------------------------------------------|------|------|--------------------------|---------------------------------------------------------------------------|------------|------------|----------|--------------
 72220110616 | Bread/Whole Grains | Bread - 100% Whole Wheat | Abiqua Farms 100% Whole Wheat Bread 24 oz            | 24   | OZ   | Albertsons #2410         | https://www.google.com/maps/place/13050%20Aurora%20Avenue%20N.,%20Seattle,%20WA | 47.7238643 | -122.34304 | 21       | None         
 17072000258 | Bread/Whole Grains | Bread - 100% Whole Wheat | Cascade Pride 100% Whole Wheat Hamburger Buns   14oz | 14   | OZ   | Hilltop Red Apple Market | https://www.google.com/maps/place/2701%20Beacon%20Ave.%20S.,%20Seattle,%20WA    | 47.5790532 | -122.31292 | 19       | None         

To reproduce the results, simply run all the Jupyter notebooks mentioned above in order. 

The last step is to upload the JSON file to Firebase's realtime database. The following steps provide intrsuctions on this process:

1. Follow the instructions [here](https://firebase.google.com/docs/web/setup) to set up a Firebase project.
2. Go to the Firebase project console.
3. Select `Database` under the `Develop` navigation bar on the left, and then `Realtime Database` in the main page.
4. Select `Import JSON` and choose `data/quantities.json`. Wait until the upload completes.
5. Go to `Rules` and paste the following to allow read/write access and use `Description` as the index key for searching. 
```
{
  "rules": {
    ".read": true,
    ".write": true,
    "data": {
      ".indexOn": ["Description"]
    }
  }
}
```
This concludes the data cleaning and Firebase database setup. We introduce the project main logic next.

