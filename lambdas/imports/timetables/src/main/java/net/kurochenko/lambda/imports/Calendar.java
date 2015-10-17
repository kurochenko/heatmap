package net.kurochenko.lambda.imports;

import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * AWS Lambda for unzipping file from one bucket to other
 *
 * @author kurochenko
 */
public class Calendar extends AbstractImporter {

    @Override
    protected PreparedStatement populateStatement(PreparedStatement ps, String[] strings, String idPrefix) throws SQLException {
        ps.setString(1, toId(idPrefix, strings[0]));
        ps.setInt(2, Integer.parseInt(strings[1]));
        ps.setInt(3, Integer.parseInt(strings[2]));
        ps.setInt(4, Integer.parseInt(strings[3]));
        ps.setInt(5, Integer.parseInt(strings[4]));
        ps.setInt(6, Integer.parseInt(strings[5]));
        ps.setInt(7, Integer.parseInt(strings[6]));
        ps.setInt(8, Integer.parseInt(strings[7]));
        ps.setInt(9, Integer.parseInt(strings[8]));
        ps.setInt(10, Integer.parseInt(strings[9]));


        return ps;
    }

    @Override
    protected String getQuery() {
        return "insert into calendar values (?,?,?,?,?,?,?,?,?,?)";
    }
}