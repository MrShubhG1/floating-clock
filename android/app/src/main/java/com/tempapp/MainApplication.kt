package com.tempapp

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {

            override fun getPackages(): List<ReactPackage> {
                return mutableListOf()
            }

            override fun getUseDeveloperSupport(): Boolean {
                return true
            }

            override fun getJSMainModuleName(): String {
                return "index"
            }
        }
}
