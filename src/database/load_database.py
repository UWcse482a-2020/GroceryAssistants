import pandas as pd
import os


class WICDatabase:

    def __init__(self, filepath:str):
        super(WICDatabase, self).__init__()
        self.filepath = os.path.join("../", "../", "data", filepath)
        self.categories = dict()
        self.load_data_()
        # TODO: does this make sense?
        # self.UPC = set()

    def load_data_(self):
        df = pd.read_csv(self.filepath)
        # edit here if more info is needed in the features
        for category in df.Category.unique():
            self.categories[category] = list(df[df.Category == category].Subcategory.unique())

    def get_categories(self) -> list:
        return list(self.categories.keys())

    def get_subcategories(self, category:str) -> list:
        return self.categories.get(category, [])
