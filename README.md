# Table of Contents
- [Install Prerequisites](https://github.com/jarrodthuener/AYX_Platform_SDK/edit/main/README.md#install-prerequisites)
- [Create an Environment](https://github.com/jarrodthuener/AYX_Platform_SDK/edit/main/README.md#create-environment)
	- [Create using python venv](https://github.com/jarrodthuener/AYX_Platform_SDK/edit/main/README.md#create-using-python-venv)
	- [Create using miniconda](https://github.com/jarrodthuener/AYX_Platform_SDK/edit/main/README.md#create-using-miniconda)
- [Install SDK and CLI](https://github.com/jarrodthuener/AYX_Platform_SDK/edit/main/README.md#install-sdk-and-cli)
- [Create a Workspace](https://github.com/jarrodthuener/AYX_Platform_SDK/edit/main/README.md#create-workspace)
	- [Create a Tool Plugin](https://github.com/jarrodthuener/AYX_Platform_SDK/edit/main/README.md#create-a-tool-plugin)
	- [Customize Tool UI](https://github.com/jarrodthuener/AYX_Platform_SDK/edit/main/README.md#customize-tool-ui)
- [Build YXI](https://github.com/jarrodthuener/AYX_Platform_SDK/edit/main/README.md#build-yxi)

# Install Prerequisites
```
Designer 2021.4+
Python 3.8.5
	pip is included
node version 12+
git
```


# Create Environment
This will likely only be done a couple of times. While you can reuse a single environment for several packages of tools, I sometimes to prefer a fresh environment for each. Some prefer to deal with a single environment for managing the dependent packages. Each tool package will be separated by their own workspace which may contain several tools. Note - you can place several packages into the same tool palette category.

There are two ways to create an environment: 1) through python venv and 2) miniconda. I think the python method (which I'll show first) is easier to imagine and organize, but choose whichever one is more comfortable for you.


## Create using python venv
### Setup folders for environments / workspace
Manually create the folder structure you'd like to use to organize the projects. I like to keep workspaces contained within each environment. In this case, I created a home folder "PlatformSDK" on my C:\ Drive.
```
PlatformSDK
	yourFirstEnvironment_venv
		workspace1
		workspace2
		workspace3
	secondEnvironment_venv
		workspace1
		workspace2
```
In the example above, my environment root path is 
```
C:\PlatformSDK\yourFirstEnvironment_venv
```

### Create the virtual environment (venv) 
Open cmd utility (powershell and terminal didn't work for me)
```
windows button -> cmd
```

Change path to Alteryx's Miniconda3 folder so we can access the python.exe:
```
CD C:\Program Files\Alteryx\bin\Miniconda3
```

Create the virtual environment. In this case, we'll create a venv called "venv_1_0_2" in our base folder "C:\PlatformSDK"
```
python -m venv C:\PlatformSDK\venv_1_0_2
```

navigate to the newly created venv Directory
```
CD C:\PlatformSDK\venv_1_0_2
```

Activate the environment
```
.\scripts\activate
```
Notice that the environment takes the name of the folder and will appear in parenthesis and we are still in our venv folder:
```
(venv_1_0_1) C:\PlatformSDK\venv_1_0_2>
```


# Install SDK and CLI
These instructions can be found at the [Platform SDK Quickstart Guide](https://help.alteryx.com/developer-help/platform-sdk-quickstart-guide)

### Install CLI
Use the following commance while in your active virtual environment:
```
pip install ayx-plugin-cli
```
[ayx-plugin-cli overview](https://help.alteryx.com/developer-help/ayx-plugin-cli-overview)

test CLI 
```
ayx_plugin_cli version
```
** note the dashes become underscores


### Install AYX Python SDK
Use the following commance while in your active virtual environment: 
```
pip install ayx-python-sdk
```

Check the version
```
ayx_python_sdk version
```

* These need to be installed for each environment created 


# Create workspace

### create and enter workspace folder:
'''
mkdir ayx_py_sample
cd ayx_py_sample
'''

### create a workspace
'''
ayx_plugin_cli sdk-workspace-init
'''

https://alteryx.github.io/ayx-python-sdk/getting_started.html#create-the-ayx-plugin-workspace


### create custom tool or plugin
	ayx_plugin_cli create-ayx-plugin
		Tool Name: Sample Tool
		Tool Type: single-input-single-output
			input, multiple-inputs, multiple-outputs, optional, output, single-input-single-output, multi-connection-input-anchor
		Description: Sample Python Tool
		Tool Version: 1.0

### navigate to ui\{tool name folder}\src
the index.tsx file will contain all of the elements for the front end UI
you'll want to add a few pieces to the file which we'll use later:

### how to handle the data pipeline on the backend
	generateData will breakdown the metadata so that it is visible to the front end elements
	  const generateData = (data) => {
	    // If the data isn't filled in, then use these default properties.
	    console.log({data})
	    if (JSON.stringify(data)=="{}" || !data) {
	      return ([]); //create a simple lookup table for "missing data" value
	    } else { 

	    // original Data without an if function Beginning - this is where the original generateDate function started
	    // This maps all "items" in the fields section of the incoming model (See model example at the bottom)
	    return data?.fields[0][0].fields.map((item) => {      
	      item.primary = item.name;
	      item.value = item.name;
	      return item 
	    });

### how to handle the compenent data.
	The handleFieldSelect function takes the values from the front end and inserts them into the configuration model
	  const handleFieldSelect = (key) => (_, newValue) => {
	    const newModel = { ...model };
	    const { Configuration } = newModel;
	    console.log('handleFieldSelect', { newValue, fieldToEdit: Configuration[key], key })
	    Configuration[key] = newValue;
	    handleUpdateModel(newModel);
	  };



Default values at the bottom:
    <DesignerApi messages={{}}defaultConfig={
      { 
        Configuration: { fieldSelect: []}, //need a sample value for our fieldSelect above so when we first open the tool it doesn't error.
        Meta: { }
      }
    }>



Then to handle these values in the backend you navigate to the .py file in the 
C:\PlatformSDK\Workspaces\ayx_py_sample\backend\ayx_plugins\sample_multi_field_input.py
On_record_batch section:
		# convert pyarrow table into pandas DF
        inputdf = pa.Table.to_pandas(batch)
        
		
        def DateTimeClean(value):
            try: 
                return parse(value, fuzzy=True)
            except: 
                return '1999-12-31 23:59:59'
    
		# self.provider.tool_config[KEY] is how to access the metadata from the front end comms.
        fieldSelect = self.provider.tool_config['fieldSelect']

        inputdf['DateTime_Out'] = inputdf[fieldSelect].apply(lambda row: 
                                     DateTimeClean(row))
        
        # convert dataframe back to pyarrow table
        batch = pa.Table.from_pandas(inputdf)
        self.provider.write_to_anchor("Output", batch)
		
logs for the tool when installed as user are here:
	C:\Users\jarro\AppData\Local\Alteryx

### install the tool
	ayx_plugin_cli designer-install
			      
