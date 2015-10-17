package net.kurochenko.lambda.unzip;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.event.S3EventNotification;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;

import java.io.*;
import java.net.URLDecoder;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * AWS Lambda for unzipping file from one bucket to other
 *
 * @author kurochenko
 */
public class Main {

    private static final Region REGION = Region.getRegion(Regions.EU_WEST_1);
    private static final String DEST_BUCKET = "heatgtfs-unzipped";


    private static AmazonS3 getAwsClient() {
        AmazonS3 s3Client = new AmazonS3Client();
        s3Client.setRegion(REGION);

        return s3Client;
    }

    private static GetObjectRequest getRequestObject(S3EventNotification.S3EventNotificationRecord record) {
        try {
            return new GetObjectRequest(
                    record.getS3().getBucket().getName(),
                    URLDecoder.decode(record.getS3().getObject().getKey().replace('+', ' '), "UTF-8")
            );
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    private static ObjectMetadata prepareMeta(int fileSize) {
        ObjectMetadata meta = new ObjectMetadata();
        meta.setContentLength(fileSize);
        meta.setContentType("text/plain");

        return meta;
    }

    private static String unzippedFileName(String parentName, String fileName) {
        return parentName.replace(".zip","") + fileName;
    }

    public S3Event handler(S3Event event, Context context) {
        S3EventNotification.S3EventNotificationRecord record = event.getRecords().get(0);
        AmazonS3 s3Client = getAwsClient();

        S3Object s3Object = s3Client.getObject(getRequestObject(record));
        InputStream objectData = s3Object.getObjectContent();

        try {

            ZipInputStream zin = new ZipInputStream(objectData);
            ZipEntry ze = null;
            while ((ze = zin.getNextEntry()) != null) {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                for (int c = zin.read(); c != -1; c = zin.read()) {
                    out.write(c);
                }

                s3Client.putObject(
                        DEST_BUCKET,
                        unzippedFileName(s3Object.getKey(), ze.getName()),
                        new ByteArrayInputStream(out.toByteArray()),
                        prepareMeta(out.size())
                );

                zin.closeEntry();
                out.close();
            }
            zin.close();
        }  catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return event;

    }
}
