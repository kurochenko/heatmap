package net.kurochenko.lambda.imports;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * AWS Lambda for unzipping file from one bucket to other
 *
 * @author kurochenko
 */
public class Stops extends AbstractImporter {

    @Override
    protected PreparedStatement populateStatement(PreparedStatement ps, String[] strings) throws SQLException {
        ps.setInt(1, Integer.parseInt(strings[0]));
        ps.setString(2, strings[1]);
        ps.setBigDecimal(3, new BigDecimal(strings[2]));
        ps.setBigDecimal(4, new BigDecimal(strings[3]));
        ps.setInt(5, Integer.parseInt(strings[4]));
        ps.setInt(6, Integer.parseInt(strings[5]));
        ps.setString(7, strings[6]);
        ps.setString(8, strings[7]);
        ps.setString(9, strings[8]);
        ps.setString(10, strings[9]);
        ps.setString(11, strings[10]);
        ps.setString(12, strings[11]);

        // Last is optional and may not be in array
        if (strings.length == 13) {
            ps.setString(13, strings[12]);
        } else {
            ps.setString(13, "");
        }

        return ps;
    }

    @Override
    protected String getQuery() {
        return "insert into  stops values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
    }
}