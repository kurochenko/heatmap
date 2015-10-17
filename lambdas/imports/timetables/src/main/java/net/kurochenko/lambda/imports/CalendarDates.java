package net.kurochenko.lambda.imports;

import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * AWS Lambda for unzipping file from one bucket to other
 *
 * @author kurochenko
 */
public class CalendarDates extends AbstractImporter {

    @Override
    protected PreparedStatement populateStatement(PreparedStatement ps, String[] strings, String idPrefix) throws SQLException {
        ps.setString(1, toId(idPrefix, strings[0]));
        ps.setInt(2, Integer.parseInt(strings[1]));
        ps.setInt(3, Integer.parseInt(strings[2]));


        return ps;
    }

    @Override
    protected String getQuery() {
        return "insert into calendar_dates values (?,?,?)";
    }
}