package nl.xservices.plugins;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Parcelable;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.http.util.ByteArrayBuffer;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.*;
import java.net.URL;
import java.util.List;
import java.util.ArrayList;

public class SocialSharing extends CordovaPlugin {

  private static final String ACTION_AVAILABLE_EVENT = "available";
  private static final String ACTION_SHARE_EVENT = "share";

  File downloadedFile;

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    try {
      if (ACTION_AVAILABLE_EVENT.equals(action)) {
        callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK));
        return true;
      } else if (ACTION_SHARE_EVENT.equals(action)) {
        final String message = args.getString(0);
        final String subject = args.getString(1);
        final String image = args.getString(2);
        final String url = args.getString(3);
        final String nameApp = args.getString(4);
        doSendIntent(nameApp, subject, message, image, url);
        callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK));
        return true;
      } else {
        callbackContext.error("socialSharing." + action + " is not a supported function. Did you mean '" + ACTION_SHARE_EVENT + "'?");
        return false;
      }
    } catch (Exception e) {
      callbackContext.error(e.getMessage());
      return false;
    }
  }

  public Intent findTwitterClient() {
    final String[] twitterApps = {
        // package // name - nb installs (thousands)
        "com.twitter.android", // official - 10 000
        "com.twidroid", // twidroyd - 5 000
        "com.handmark.tweetcaster", // Tweecaster - 5 000
        "com.thedeck.android" // TweetDeck - 5 000 };
    };
    Intent tweetIntent = new Intent();
    tweetIntent.setType("image/*");
    final PackageManager packageManager = webView.getContext().getPackageManager();
    List<ResolveInfo> list = packageManager.queryIntentActivities(
        tweetIntent, PackageManager.MATCH_DEFAULT_ONLY);
 
    for (int i = 0; i < twitterApps.length; i++) {
      for (ResolveInfo resolveInfo : list) {
        String p = resolveInfo.activityInfo.packageName;
        if (p != null && p.startsWith(twitterApps[i])) {
          tweetIntent.setPackage(p);
          return tweetIntent;
        }
      }
    }
    return null;
  }

  public Intent findInstagramClient() {
    final String[] twitterApps = {
        // package // name - nb installs (thousands)
        "com.instagram.android", // official - 10 000
    };
    Intent tweetIntent = new Intent();
    tweetIntent.setType("image/*");
    final PackageManager packageManager = webView.getContext().getPackageManager();
    List<ResolveInfo> list = packageManager.queryIntentActivities(
        tweetIntent, PackageManager.MATCH_DEFAULT_ONLY);
 
    for (int i = 0; i < twitterApps.length; i++) {
      for (ResolveInfo resolveInfo : list) {
        String p = resolveInfo.activityInfo.packageName;
        if (p != null && p.startsWith(twitterApps[i])) {
          tweetIntent.setPackage(p);
          return tweetIntent;
        }
      }
    }
    return null;
  }

  //private void share(String nameApp, String imagePath) {
  private void doSendIntent(String nameApp, String subject, String message, String image, String url) throws IOException {
    List<Intent> targetedShareIntents = new ArrayList<Intent>();
    Intent share = new Intent(android.content.Intent.ACTION_SEND);
    share.setType("image/*");
    List<ResolveInfo> resInfo = webView.getContext().getPackageManager().queryIntentActivities(share, 0);
    if (!resInfo.isEmpty()){
        for (ResolveInfo info : resInfo) {
            Intent targetedShare = new Intent(android.content.Intent.ACTION_SEND);
            targetedShare.setType("image/jpeg"); // put here your mime type

            if (info.activityInfo.packageName.toLowerCase().contains(nameApp) || 
                    info.activityInfo.name.toLowerCase().contains(nameApp)) {
                targetedShare.putExtra(Intent.EXTRA_TEXT, subject);
                targetedShare.putExtra(Intent.EXTRA_STREAM, Uri.parse(image));
                targetedShare.setPackage(info.activityInfo.packageName);
                targetedShareIntents.add(targetedShare);
            }
        }

        Intent chooserIntent = Intent.createChooser(targetedShareIntents.remove(0), "Select app to share");
        chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, targetedShareIntents.toArray(new Parcelable[]{}));
        //startActivity(chooserIntent);
        webView.getContext().startActivity(chooserIntent);
        //this.cordova.startActivityForResult(this, chooserIntent, 0);
    }
  }

/*
  private void doSendIntent(String subject, String message, String image, String url) throws IOException {
    //final Intent sendIntent = new Intent(android.content.Intent.ACTION_SEND);
    final Intent sendIntent = findInstagramClient(); 
    final String dir = webView.getContext().getExternalFilesDir(null) + "/socialsharing-downloads";
    createDir(dir);
    sendIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET);

    String localImage = image;
    if ("".equals(image) || "null".equalsIgnoreCase(image)) {
      sendIntent.setType("text/plain");
    } else {
      sendIntent.setType("image/*");
      if (image.startsWith("http") || image.startsWith("www/")) {
        final String filename = getFileName(image);
        //localImage = "file://" + dir + "/" + filename;
        if (image.startsWith("http")) {
          downloadFromUrl(new URL(image).openConnection().getInputStream(), dir, filename);
        } else {
          downloadFromUrl(webView.getContext().getAssets().open(image), dir, filename);
        }
      } else if (!image.startsWith("file://")) {
        throw new IllegalArgumentException("URL_NOT_SUPPORTED");
      }
      //sendIntent.putExtra(android.content.Intent.EXTRA_STREAM, Uri.parse(localImage));
      sendIntent.putExtra(android.content.Intent.EXTRA_STREAM, Uri.fromFile(new File(localImage)));
    }
    if (!"".equals(subject) && !"null".equalsIgnoreCase(subject)) {
      sendIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
    }
    // add the URL to the message, as there seems to be no separate field
    if (!"".equals(url) && !"null".equalsIgnoreCase(url)) {
      if (!"".equals(message) && !"null".equalsIgnoreCase(message)) {
        message += " " + url;
      } else {
        message = url;
      }
    }
    if (!"".equals(message) && !"null".equalsIgnoreCase(message)) {
      sendIntent.putExtra(android.content.Intent.EXTRA_TEXT, message);
    }

    this.cordova.startActivityForResult(this, sendIntent, 0);
  }

*/

  // cleanup after ourselves
  public void onActivityResult(int requestCode, int resultCode, Intent intent) {
    if (downloadedFile != null) {
      downloadedFile.delete();
    }
  }

  private void createDir(final String downloadDir) throws IOException {
    final File dir = new File(downloadDir);
    if (!dir.exists()) {
      if (!dir.mkdirs()) {
        throw new IOException("CREATE_DIRS_FAILED");
      }
    }
  }

  private String getFileName(String url) {
    final int lastIndexOfSlash = url.lastIndexOf('/');
    if (lastIndexOfSlash == -1) {
      return url;
    } else {
      return url.substring(lastIndexOfSlash + 1);
    }
  }

  private void downloadFromUrl(InputStream is, String dirName, String fileName) throws IOException {
    final File dir = new File(dirName);
    downloadedFile = new File(dir, fileName);
    BufferedInputStream bis = new BufferedInputStream(is);
    ByteArrayBuffer baf = new ByteArrayBuffer(5000);
    int current;
    while ((current = bis.read()) != -1) {
      baf.append((byte) current);
    }
    FileOutputStream fos = new FileOutputStream(downloadedFile);
    fos.write(baf.toByteArray());
    fos.flush();
    fos.close();
  }
}
