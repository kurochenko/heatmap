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
    protected PreparedStatement populateStatement(PreparedStatement ps, String[] strings, String idPrefix) throws SQLException {
        ps.setString(1, toId(idPrefix, strings[0]));
        ps.setString(2, toId(idPrefix, strings[1]));
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