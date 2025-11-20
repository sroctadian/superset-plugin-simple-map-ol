# plugin-simple-map-ol

Superset plugin untuk menampilkan map sederhana dengan menggunakan `Open Layer`



### Features

1.  Filter untuk tampilan point ( lon, lat ) berdasarkan tipe
2.  Auto clustering untuk point-point yang berdekatan



### Contoh Data

```json
nama,lon,lat,tipe,deskripsi,icon_url
Lokasi 1,106.827153,-6.175392,Kantor,"Lokasi sample di Jakarta Pusat","https://your/point/icon"
Lokasi 2,106.828200,-6.176100,Kantor,"Lokasi sample di Jakarta Pusat","https://your/icon.svg"
Lokasi 3,106.829100,-6.175900,Kantor,"Lokasi sample di Jakarta Pusat","https://your/icon.svg"
Lokasi 4,106.830500,-6.176500,Kantor,"Lokasi sample di Jakarta Pusat","https://your/icon.svg"
Lokasi 5,106.829900,-6.174800,Kantor,"Lokasi sample di Jakarta Pusat","https://your/icon.svg"
Lokasi 6,106.826900,-6.174200,Gudang,"Gudang area Monas","https://your/icon.svg"
Lokasi 7,106.827800,-6.174900,Gudang,"Gudang area Monas","https://your/icon.svg"
Lokasi 8,106.828900,-6.175400,Gudang,"Gudang area Monas","https://your/icon.svg"
Lokasi 9,106.829700,-6.176200,Gudang,"Gudang area Monas","https://your/icon.svg"
Lokasi 10,106.830300,-6.176800,Gudang,"Gudang area Monas","https://your/icon.svg"
Lokasi 11,112.743000,-7.257400,Kantor,"Lokasi area Surabaya Pusat","https://your/icon.svg"
Lokasi 12,112.744200,-7.257100,Kantor,"Lokasi area Surabaya Pusat","https://your/icon.svg"
Lokasi 13,112.745000,-7.258000,Toko,"Toko area Surabaya","https://your/icon.svg"
Lokasi 14,112.746800,-7.257300,Toko,"Toko area Surabaya","https://your/icon.svg"
Lokasi 15,112.747900,-7.258500,Toko,"Toko area Surabaya","https://your/icon.svg"
Lokasi 16,112.749300,-7.258900,Gudang,"Gudang area Surabaya","https://your/icon.svg"
Lokasi 17,112.750200,-7.259300,Gudang,"Gudang area Surabaya","https://your/icon.svg"
Lokasi 18,112.751500,-7.259900,Gudang,"Gudang area Surabaya","https://your/icon.svg"
Lokasi 19,112.752700,-7.258200,Agen,"Agen area Surabaya","https://your/icon.svg"
Lokasi 20,112.753800,-7.257800,Agen,"Agen area Surabaya","https://your/icon.svg"
Lokasi 21,107.619100,-6.917500,Kantor,"Lokasi di Bandung","https://your/icon.svg"
Lokasi 22,107.618800,-6.918100,Kantor,"Lokasi di Bandung","https://your/icon.svg"
Lokasi 23,107.620200,-6.919000,Toko,"Toko di Bandung","https://your/icon.svg"
Lokasi 24,107.621300,-6.919200,Toko,"Toko di Bandung","https://your/icon.svg"
Lokasi 25,107.622400,-6.918300,Gudang,"Gudang Bandung","https://your/icon.svg"
Lokasi 26,107.623200,-6.917900,Gudang,"Gudang Bandung","https://your/icon.svg"
Lokasi 27,107.624100,-6.918500,Distributor,"Distributor Bandung","https://your/icon.svg"
Lokasi 28,107.625300,-6.919000,Distributor,"Distributor Bandung","https://your/icon.svg"
Lokasi 29,107.626100,-6.918200,Agen,"Agen Bandung","https://your/icon.svg"
Lokasi 30,107.626900,-6.917600,Agen,"Agen Bandung","https://your/icon.svg"
```



  ### Langkah build dan pembuatan plugin

Untuk penggunaan build langsung code repository yang telah dibuat dapat mengikuti langkah dibawah ini dengan skip langkah `create new plugins` dan `modifying script`.

1.  Prerequisites

    -   node 20.19.5

        ```sh
        nvm install lts/iron
        nvm use lts/iron
        ```

    -   python 3.11

        ```sh
        uv venv --python 3.11
        source .venv/bin/activate
        alias pip=.venv/bin/pip3.11
        pip install build
        ```

    

2.  Clone superset repository

    ```sh
    git clone https://github.com/apache/superset.git
    git checkout 4.1.4
    ```

    

3.  Build development environment

    ```sh
    cd superset/superset-frontend
    npm i
    npm run build
    
    echo "SECRET_KEY = '$(openssl rand -base64 42)'" > /your/path/superset/superset_config.py
    export SUPERSET_CONFIG_PATH=/your/path/superset/superset_config.py
    
    pip install -r requirements/base.txt
    superset db upgrade
    superset init
    superset fab create-admin
    ```

    

4.  Custom plugin development

    -   install  Superset Yeoman Generator

        ```sh
        cd superset/superset-frontend
        npm ci
        npm i -g yo
        cd superset-frontend/packages/generator-superset
        npm link
        ```

        

    -   create new plugins

        ```sh
        mkdir /your/path/your-plugin
        cd /your/path/your-plugin
        yo @superset-ui/superset
        # lengkapi form
        npm i
        ```

        

    -   modifying script

        ```sh
        # Start developing your script
        ```

        

    -   build plugins

        ```sh
        npm install --save-dev @airbnb/config-babel
        npm install --save-dev babel-plugin-typescript-to-proptypes
        npm install --save-dev typescript@5.3
        npm install --save-dev @types/node@20
        
        npm ci
        npm run build
        ```

        

5.  Integrate plugin with Superset

    -   install custom plugin into superset-frontend

        ```sh
        cd superset/superset-frontend
        npm i -S /your/path/your-plugin
        ```

        

    -   integrate with Superset

        After this edit the `superset-frontend/src/visualizations/presets/MainPreset.js` and make the following changes:

        ```javascript
        import { PluginSimpleMapOl } from 'plugin-simple-map-ol';
        ```

        to import the plugin and later add the following to the array that's passed to the `plugins` property: 

        ```javascript
        new PluginSimpleMapOl().configure({ key: 'plugin-simple-map-ol' }),
        ```

        

6.  Build

    -   build superset-frontend

        ```sh
        cd superset/superset-frontend
        npm ci
        npm run build
        ```

        

    -   build superset

        ```sh
        cd superset/
        python -m build
        ```



### Enabled CORS:

  - Install CORS library
    
    ```sh
    cd superset
    pip install flask_cors
    ```
    
    
    
  - Enabled CORS Talisman
    
    edit the `superset/superset_config.py` and add configuration below:
    
    ```json
ENABLE_CORS = True
    CORS_OPTIONS = {"origins": ["http://127.0.0.1:8088", "*"], "send_wildcard": True}
# change origin with your application
    
    TALISMAN_ENABLED = False
    
    TALISMAN_CONFIG = {
        "force_https": False,
        "content_security_policy": {
            "img-src": [
                "*",
                "'self'",
                "blob:",
                "data:",
                "https://apachesuperset.gateway.scarf.sh",
                "https://static.scarf.sh/",
                "https://cdn.brandfolder.io",
                "http://ows.terrestris.de",
                "*.tile.openstreetmap.org",
                "tile.openstreetmap.org",
                "https://tile.openstreetmap.org",
                "https://a.tile.openstreetmap.org",
                "https://b.tile.openstreetmap.org",
                "https://c.tile.openstreetmap.org",
                "https://www.flaticon.com",
                "https://www.svgrepo.com/show/498964/menu.svg",
            ],
            "worker-src": ["*"],
            "base-uri": ["*"],
            "frame-ancestors": [
                "'self'",
                "https://tile.openstreetmap.org",
                "https://www.flaticon.com",
                "https://www.svgrepo.com",
            ],
        }
    ```

### 
