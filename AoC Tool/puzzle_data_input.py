# Copyright (C) 2022 Alteryx, Inc. All rights reserved.
#
# Licensed under the ALTERYX SDK AND API LICENSE AGREEMENT;
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    https://www.alteryx.com/alteryx-sdk-and-api-license-agreement
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Example input tool."""
from collections import namedtuple

from ayx_python_sdk.core import PluginV2
from ayx_python_sdk.providers.amp_provider.amp_provider_v2 import AMPProviderV2

from pyarrow import Table




class PuzzleDataInput(PluginV2):
    """Concrete implementation of an AyxPlugin."""

    def __init__(self, provider: AMPProviderV2) -> None:
        """Construct a plugin."""
        self.provider = provider
        self.config_value = 0.42
        self.provider.io.info("Plugin initialized.")

    def on_incoming_connection_complete(self, anchor: namedtuple) -> None:
        """
        Call when an incoming connection is done sending data including when no data is sent on an optional input anchor.

        This method IS NOT called during update-only mode.

        Parameters
        ----------
        anchor
            NamedTuple containing anchor.name and anchor.connection.
        """
        raise NotImplementedError("Input tools don't receive batches.")

    def on_record_batch(self, batch: "Table", anchor: namedtuple) -> None:
        """
        Process the passed record batch that comes in on the specified anchor.

        The method that gets called whenever the plugin receives a record batch on an input.

        This method IS NOT called during update-only mode.

        Parameters
        ----------
        batch
            A pyarrow Table containing the received batch.
        anchor
            A namedtuple('Anchor', ['name', 'connection_name']) containing input connection identifiers.
        """
        raise NotImplementedError("Input tools don't receive batches.")

    def on_complete(self) -> None:
        """
        Clean up any plugin resources, or push records for an input tool.

        This method gets called when all other plugin processing is complete.

        In this method, a Plugin designer should perform any cleanup for their plugin.
        However, if the plugin is an input-type tool (it has no incoming connections),
        processing (record generation) should occur here.

        Note: A tool with an optional input anchor and no incoming connections should
        also write any records to output anchors here.
        """
        import pandas as pd
        import pyarrow as pa
        import os
        # for new libraries, add to env/tool/.ayx_cli.cache/requirements-thirdparty.txt file
        from selenium.webdriver.common.by import By
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        import requests
        from datetime import datetime
        import pytz

         
        InputData = self.provider.tool_config
        folderPath = InputData['folderPath']
        sessionID = InputData['sessionID']
        customDate = InputData['customDate']
        inputYear = InputData['year']
        inputDay = InputData['day']

        if customDate:
            day = inputDay
            year = inputYear
        else:
            current = datetime.now(pytz.timezone('US/Eastern'))
            day = current.strftime('%d').lstrip('0')
            year = current.strftime('%Y')
        
        dataFileName = "day"+str(day)+".txt"
        dataFilePath = os.path.join(folderPath,dataFileName)
        sampleDataURL = 'https://adventofcode.com/'+year+'/day/'+day
        fullDataURL = 'https://adventofcode.com/'+year+'/day/'+day+"/input"
        
        variables = {
            "InputData":InputData,
            "dataFileName":dataFileName,
            "dataFilePath":dataFilePath,
            "sampleDataURL":sampleDataURL,
            "fullDataURL":fullDataURL
        }
        self.provider.io.info("full variable list: ",variables)


        def pullSampleData():
            options = Options()
            options.headless = True
            browser = webdriver.Chrome(options=options)
            browser.get(sampleDataURL)
            browser.add_cookie({"name":"session", "value":sessionID})
            elements = browser.find_elements(By.TAG_NAME, "code")
            self.provider.io.info("SampleData: ",elements[0])
            return elements[0].text

        def pullFullData():
            headers = {"cookie":"session="+sessionID}
            fullData = requests.get(fullDataURL,headers=headers)
            print(fullData.text)
            return fullData.text


        df = pd.DataFrame({ 
            "folderPath":InputData['folderPath'], 
            "year":InputData['year'] , 
            "day":InputData['day'], 
            "customDate":InputData['customDate'], 
            "sessionID":InputData['sessionID']}, index=[0])
        
        # add User-Agent: jarrodthuener@gmail.com to the headers.
        fullDailyData=''

        # """check to see if today's data exists"""
        # if os.path.exists(dataFilePath):
        #     fullDailyData = open(dataFilePath,"r").read()
        #     self.provider.io.info('Pulling data from cached file: '+dataFilePath)
        # else:
        #     try:
        #         self.provider.io.info('Pulling sample data from AoC site.')
        #         finalSampleData = pullSampleData()
        #         try:
        #             self.provider.io.info('Sample data pulled successfully from AoC site. Now pulling full data.')
        #             finalFullData = pullFullData()
        #             fullDailyData = finalSampleData + "\nSplit From Here\n" + finalFullData
        #             self.provider.io.info('Full Data has been pulled.')
        #             # print(fullDailyData)
        #             try:
        #                 self.provider.io.info('Saving data locally.')
        #                 f = open(dataFilePath, "w")
        #                 f.write(finalSampleData + "\nSplit From Here\n" + finalFullData)
        #                 f.close()
        #                 fullDailyData = finalSampleData + "\nSplit From Here\n" + finalFullData
        #                 self.provider.io.info('Data saved.')
        #             except:
        #                 self.provider.io.info("Error Writing files")
        #         except:
        #             self.provider.io.info("Error pulling Full Data")
        #     except:
        #         self.provider.io.info("Error pulling Sample Data")
        
        # df = pd.DataFrame(fullDailyData.split('\n'),columns=["data"])

        df = pd.DataFrame(variables)

        # df = pd.DataFrame(
        #     {
        #         "x": [1, 2, 3],
        #         "y": ["hello", "world", "from ayx_python_sdk!"],
        #         "z": [self.config_value, self.config_value, self.config_value],
        #     }
        # )

        packet = pa.Table.from_pandas(df)

        self.provider.write_to_anchor("Output", packet)
        self.provider.io.info("PuzzleDataInput tool done.")
