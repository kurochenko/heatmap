package net.kurochenko.lambda.imports;

import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * AWS Lambda for unzipping file from one bucket to other
 *
 * @author kurochenko
 */
public class StopTimes extends AbstractImporter {

    @Override
    protected PreparedStatement populateStatement(PreparedStatement ps, String[] strings, String idPrefix) throws SQLException {
        ps.setString(1, toId(idPrefix, strings[0]));
        ps.setString(2, strings[1]);
        ps.setString(3, strings[2]);
        ps.setString(4, toId(idPrefix, strings[3]));
        ps.setInt(5, Integer.parseInt(strings[4]));
        ps.setInt(6, Integer.parseInt(strings[5]));
        ps.setInt(7, Integer.parseInt(strings[6]));
        ps.setInt(8, Integer.parseInt(strings[7]));

        return ps;
    }

    @Override
    protected String getQuery() {
        return "insert into  stop_times values (?,?,?,?,?,?,?,?)";
    }
}