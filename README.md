# Comport Admin

Administration Panel for Comport Platform (AMR Performance).

The app is built using Vue on top of electron, To build it simply run the `yarn build` command in the root directory of the app (source code)

> Note: in `./resources` there are binary executables that need to be recompilied for the target platform; Currently included binaries are already compiled for Windows (and ready for use)

### Configuration:

Before starting developement or building for production make sure to update the configuration (if necessary) in the config file `./src/renderer/config.json`
Config Structure:
```
{

    // mongodb connection uri (with username & password) for the platform's database
    "mongo_uri": "mongodb+srv://xxxx:xxx@domain.xx",

    "apiBaseUrl": {

        // API Base url for Production (without trailing slash)
        "prod": "https://api.amrcomport.com:8086",

        // API Base url for Development (without trailing slash)
        "dev": "http://localhost:9085"

    }
}
```

### Build Setup

``` bash
# install dependencies
yarn

# run in developement mode with hot reload
yarn dev

# build electron application for production
yarn build

```
> Note: After running the build, the built app (installer) will be located in `./build`

---

### External Tools:

Thus are external programs (executables or scripts) located inside `./resources` used by Tools from the 'Tools' tab/page

> Note: Some of the tools are java's .jar or python scripts, So make sure JRE and Python are installed on the machine where you run this app

- FRF Decryption: Tested and works fine using `Python 3.10.2`
- Some Java's Tools require java class version 59 and newer

---

# Step by Step Guides

## Compiling/Building the app

> System preparation: Make sure to install NodeJS and Yarn, after installing node, install yarn using this command `npm install yarn -g`

#### When building the app for the first time:

1. Clone the git respository using `git clone <url of the repo>`
2. Update confirguration in `<project-directory>/src/renderer/config.json` (see the previous section *"configuration"*)
3. Open the project's / app's folder in CMD
4. Install node modules using this command `yarn`
5. Build the app using this command `yarn build`
6. Navigate to the output direcotry `<project-directory>/build`
7. You should fine there the Setup/Installer named `Comport Admin Setup x.x.x.exe`

#### When building the app sub-sequently:

1. Open the project's / app's folder in CMD
2. Build the app using this command `yarn build`
3. Navigate to the output direcotry `<project-directory>/build`
4. You should fine there the Setup/Installer named `Comport Admin Setup x.x.x.exe`


# Modifying the code

Check `docs` folder for instructions