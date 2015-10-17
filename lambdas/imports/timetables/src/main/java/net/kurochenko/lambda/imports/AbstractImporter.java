package net.kurochenko.lambda.imports;

import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.event.S3EventNotification;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.S3Object;

import java.io.*;
import java.net.URLDecoder;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * @author kurochenko
 */
public abstract class AbstractImporter {

    private static final Region REGION = Region.getRegion(Regions.EU_WEST_1);


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


    public S3Event handler(S3Event event, Context context) {


        S3EventNotification.S3EventNotificationRecord record = event.getRecords().get(0);
        AmazonS3 s3Client = getAwsClient();

        S3Object s3Object = s3Client.getObject(getRequestObject(record));


        InputStream objectData = s3Object.getObjectContent();
        BufferedReader reader = new BufferedReader(new InputStreamReader(objectData));


        String dbUrl = "jdbc:mysql://timetables-cluster.cluster-c3wf97boae1g.eu-west-1.rds.amazonaws.com:3306/timetables";
        String dbClass = "com.mysql.jdbc.Driver";
        String username = "heatmap";
        String password = "heatmap007";


        Connection connection = null;
        try {
            Class.forName(dbClass);
            connection = DriverManager.getConnection(dbUrl,username, password);
            connection.setAutoCommit(false);
            reader.readLine(); // Skip header line

            PreparedStatement ps = connection.prepareStatement(getQuery());

            int i = 0;
            for (String str = reader.readLine(); str != null; str = reader.readLine()) {
                String[] strings = str.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                System.out.println(String.join(" :: ", strings));


                populateStatement(ps, strings);

                ps.addBatch();

                if (i % 1000 == 0) {
                    ps.executeBatch();
                }
                i++;

            }
            ps.executeBatch();
            connection.commit();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (connection != null) {
                try {
                    connection.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }

        return event;
    }

    protected abstract PreparedStatement populateStatement(PreparedStatement ps, String[] strings) throws SQLException;

    protected abstract String getQuery();

}
