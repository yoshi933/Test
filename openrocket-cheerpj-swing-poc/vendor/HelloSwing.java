import javax.swing.*;
import java.awt.*;

public class HelloSwing {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Hello Swing via CheerpJ");
            JLabel label = new JLabel("Swing is running inside the browser", SwingConstants.CENTER);
            JButton button = new JButton("Click me");

            button.addActionListener(e -> label.setText("Button clicked"));

            JPanel panel = new JPanel(new BorderLayout());
            panel.add(label, BorderLayout.CENTER);
            panel.add(button, BorderLayout.SOUTH);

            frame.setContentPane(panel);
            frame.setSize(500, 300);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setVisible(true);
        });
    }
}
