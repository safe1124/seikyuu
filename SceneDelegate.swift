import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        
        window = UIWindow(windowScene: windowScene)
        let viewController = ViewController() // Assuming ViewController is the initial view controller
        window?.rootViewController = viewController
        window?.makeKeyAndVisible()
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // Called when the scene has disconnected from the app.
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Called when the scene has become active.
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // Called when the scene will resign active.
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Called as the scene transitions from the background to the foreground.
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Called when the scene enters the background.
    }
}