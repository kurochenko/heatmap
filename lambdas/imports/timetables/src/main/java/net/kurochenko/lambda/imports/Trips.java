package net.kurochenko.lambda.imports;

import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * AWS Lambda for unzipping file from one bucket to other
 *
 * @author kurochenko
 */
public class Trips extends AbstractImporter {

    @Override
    protected PreparedStatement populateStatement(PreparedStatement ps, String[] strings) throws SQLException {
        ps.setInt(1, Integer.parseInt(strings[0]));
        ps.setInt(2, Integer.parseInt(strings[2]));
        ps.setString(3, strings[3]);
        ps.setInt(4, Integer.parseInt(strings[4]));
        ps.setInt(5, Integer.parseInt(strings[5]));
        ps.setInt(6, Integer.parseInt(strings[6]));
        ps.setString(7, strings[7]);

        return ps;
    }

    @Override
    protected String getQuery() {
        return "insert into trips values (?,?,?,?,?,?,?)";
    }
}