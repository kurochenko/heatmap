package net.kurochenko.lambda.imports;

import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * AWS Lambda for unzipping file from one bucket to other
 *
 * @author kurochenko
 */
public class Routes extends AbstractImporter {

    @Override
    protected PreparedStatement populateStatement(PreparedStatement ps, String[] strings) throws SQLException {
        ps.setInt(1, Integer.parseInt(strings[0]));
        ps.setInt(2, Integer.parseInt(strings[1]));
        ps.setString(3, strings[2]);
        ps.setString(4, strings[3]);
        ps.setInt(5, Integer.parseInt(strings[4]));
        ps.setString(6, strings[5]);

        return ps;
    }

    @Override
    protected String getQuery() {
        return "insert into routes values (?,?,?,?,?,?)";
    }
}