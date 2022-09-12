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
"""Example pass through tool."""
from ast import Or
from logging import Logger
from typing import TYPE_CHECKING



from ayx_python_sdk.core import (
    Anchor,
    PluginV2,
)
from ayx_python_sdk.providers.amp_provider.amp_provider_v2 import AMPProviderV2
import pyarrow as pa
import pandas as pd
from dateutil.parser import parse
from collections import OrderedDict 

if TYPE_CHECKING:
    import pyarrow as pa


class SampleMultiFieldInput(PluginV2):
    """A sample Plugin that passes data from an input connection to an output connection."""
    
    def __init__(self, provider: AMPProviderV2):
        """Construct the plugin."""
        self.name = "Pass through"
        self.provider = provider
        self.provider.io.info(f"{self.name} tool started")
        

    def on_record_batch(self, batch: "pa.Table", anchor: Anchor) -> None:
        """
        Process the passed record batch.

        The method that gets called whenever the plugin receives a record batch on an input.

        This method IS NOT called during update-only mode.

        Parameters
        ----------
        batch
            A pyarrow Table containing the received batch.
        anchor
            A namedtuple('Anchor', ['name', 'connection']) containing input connection identifiers.
        """
        # helper functions to extract field list
        # account for each type of object returned (can be list or OrderedDict)
        def extractFields(fieldListObject):
            fieldList=[]
            if type(fieldListObject)==list:
                # if the field is multi select it will return a list of field metadata
                # cycle through each object to extracte the "value"
                for fields in fieldListObject:
                    fieldList.append(fields['value'])
                return fieldList
            if type(fieldListObject)==OrderedDict:
                # if the field is single-select it will return a dict of field metadata
                # grab the single value and put it into a list.
                fieldList.append(fieldListObject['value'])
                return fieldList

        # use the function to create a list which we can later reference for our functions
        firstMultiSelect = extractFields(self.provider.tool_config['autocomplete'])
        
        def DateTimeClean(value):
            try: 
                return parse(value, fuzzy=True)
            except: 
                return '1999-12-31 23:59:59'
            
        # how to push a message through to alteryx
        # self.provider.io.info(f"firstMultiSelect")

        # how to push a variable as a message through to alteryx
        # self.provider.io.info(f"{firstMultiSelect} - this is the text")

		# convert pyarrow table into pandas DF
        inputdf = pa.Table.to_pandas(batch)
        
		


        for i in firstMultiSelect:
            inputdf[i+'_DT'] = inputdf[i].apply(lambda row: DateTimeClean(row))
       

		# self.provider.tool_config[KEY] is how to access the metadata from the front end comms.
        # below is how you deal with a single value tool_config
        # fieldSelect = self.provider.tool_config['fieldSelect']

        # if you only want to run the function for a single field:
        # inputdf['DateTime_Out'] = inputdf[fieldSelect].apply(lambda row: 
        #                              DateTimeClean(row))


        # convert dataframe back to pyarrow table
        batch = pa.Table.from_pandas(inputdf)
        
        self.provider.write_to_anchor("Output", batch)

    def on_incoming_connection_complete(self, anchor: Anchor) -> None:
        """
        Call when an incoming connection is done sending data including when no data is sent on an optional input anchor.

        This method IS NOT called during update-only mode.

        Parameters
        ----------
        anchor
            NamedTuple containing anchor.name and anchor.connection.
        """
        self.provider.io.info(f"Connection {anchor.connection} on Anchor {anchor.name}")

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
        self.provider.io.info(f"{self.name} tool done")
