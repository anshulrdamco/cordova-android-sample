package org.sample.hybrid;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.sample.hybridandroidapp.MyListActivity;

import java.util.ArrayList;

/**
 * Created by hschinsk on 6/18/15.
 */
public class HybridBridge extends CordovaPlugin {
    public ArrayList itemsList = new ArrayList();
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        try {
             if (action.equals("addItem")) {
                String item = args.getString(0);
                Context context = cordova.getActivity().getApplicationContext();
                Intent intent = new Intent(context, MyListActivity.class);
                itemsList.add(item);
                Log.d("hybridclass","data here");
                intent.putStringArrayListExtra("items", itemsList);
                cordova.startActivityForResult(this,intent,1);
                callbackContext.success();
                return true;
            } else {
                callbackContext.error("Invalid action");
                return false;
            }

        } catch(Exception e) {
            e.printStackTrace();
            System.err.println("Exception: " + e.getMessage());
            callbackContext.error(e.getMessage());
            return false;
        }
    }
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        itemsList = data.getStringArrayListExtra("items");
    }

}
