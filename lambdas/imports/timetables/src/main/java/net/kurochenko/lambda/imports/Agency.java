package net.kurochenko.lambda.imports;

import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * AWS Lambda for unzipping file from one bucket to other
 *
 * @author kurochenko
 */
public class Agency extends AbstractImporter {


    @Override
    protected PreparedStatement populateStatement(PreparedStatement ps, String[] strings) throws SQLException {
        ps.setInt(1, Integer.parseInt(strings[0]));
        ps.setString(2, strings[1]);
        ps.setString(3, strings[2]);
        ps.setString(4, strings[3]);
        ps.setString(5, strings[4]);
        ps.setString(6, strings[5]);
        ps.setString(7, strings[6]);

        return ps;
    }

    @Override
    protected String getQuery() {
        return "insert into  agency values (?,?,?,?,?,?,?)";
    }
}