/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package org.sample.hybridandroidapp;

import android.graphics.Bitmap;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.apache.cordova.*;
import org.apache.cordova.engine.SystemWebView;
import org.apache.cordova.engine.SystemWebViewClient;
import org.apache.cordova.engine.SystemWebViewEngine;
public class MainActivity extends CordovaActivity
{

    WebView myWebView;
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        // enable Cordova apps to be started in the background
        Bundle extras = getIntent().getExtras();
        if (extras != null && extras.getBoolean("cdvStartInBackground", false)) {
            moveTaskToBack(true);
        }


        loadUrl(launchUrl);



        /*

              myWebView = (WebView) this.appView.getView();

        myWebView.setWebViewClient(new SystemWebViewClient((SystemWebViewEngine) this.appView.getEngine()){
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                showLog("shouldOverrideUrlLoading",url);
                return super.shouldOverrideUrlLoading(view, url);
            }
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
            }
        });

        CordovaWebViewEngine wv = appView.getEngine();

        SystemWebView swv = (SystemWebView) wv.getCordovaWebView();

        swv.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                showLog("shouldOverrideUrlLoading",request.toString());
                return super.shouldOverrideUrlLoading(view, request);
            }
        });

        swv.setWebViewClient(new SystemWebViewClient((SystemWebViewEngine)appView.getEngine()){
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                Log.i("CSP Log", "onPageStarted: " + url);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.i("CSP Log", "onPageFinished: " + url);
            }

            @Override
            public void doUpdateVisitedHistory(WebView view, String url, boolean isReload){
                super.doUpdateVisitedHistory(view, url, isReload);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
            }
        });*/
        // Set by <content src="index.html" /> in config.xml


    }



}
